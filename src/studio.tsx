import { createRoot, extend } from '@react-three/fiber'
import { Environment } from '@react-three/drei/core/Environment'
import {
  Box3, Color, DirectionalLight, Fog, Material, Mesh, MeshStandardMaterial,
  Object3D, PerspectiveCamera, PlaneGeometry, PMREMGenerator, Scene, Texture,
  Vector3, WebGLRenderer, type WebGLRenderTarget,
} from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { StageState } from './VehicleStage'

extend({ DirectionalLight, Mesh, MeshStandardMaterial, PlaneGeometry })

function releaseModel(model: Object3D) {
  const materials = new Set<Material>()
  const textures = new Set<Texture>()
  model.traverse(object => {
    if (object instanceof Mesh) {
      object.geometry.dispose()
      for (const material of [object.material].flat()) materials.add(material)
    }
  })
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof Texture) textures.add(value)
    }
    material.dispose()
  }
  for (const texture of textures) {
    texture.dispose()
    if (typeof ImageBitmap !== 'undefined' && texture.image instanceof ImageBitmap) texture.image.close()
  }
}

// Project the eight corners onto the camera axes, leaving a margin on every edge.
function frame(camera: PerspectiveCamera, box: Box3, aspect: number) {
  const center = box.getCenter(new Vector3())
  const direction = new Vector3(0.7, 0.32, 1).normalize()
  const right = new Vector3().crossVectors(camera.up, direction).normalize()
  const up = new Vector3().crossVectors(direction, right)
  const slope = Math.tan(camera.fov * Math.PI / 360)
  let distance = 0
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const corner = new Vector3(x, y, z).sub(center)
        const projected = Math.max(Math.abs(corner.dot(right)) / aspect, Math.abs(corner.dot(up)))
        distance = Math.max(distance, corner.dot(direction) + 1.12 * projected / slope)
      }
    }
  }
  camera.aspect = aspect
  camera.position.copy(center).addScaledVector(direction, distance)
  camera.lookAt(center)
  camera.updateProjectionMatrix()
}

export async function mountStudio(host: HTMLElement, lifetime: AbortSignal, report: (state: StageState) => void) {
  const canvas = document.createElement('canvas')
  canvas.setAttribute('role', 'img')
  canvas.setAttribute('aria-label', 'Three-quarter studio view of the vehicle')
  let gl: WebGLRenderer
  try {
    gl = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' })
  } catch {
    report('unsupported')
    return
  }
  host.append(canvas)
  const session = new AbortController()
  let model: Object3D | undefined
  let environment: WebGLRenderTarget | undefined
  let root: ReturnType<typeof createRoot> | undefined
  let observer: ResizeObserver | undefined
  const stop = () => {
    if (session.signal.aborted) return
    session.abort()
    lifetime.removeEventListener('abort', stop)
    observer?.disconnect()
    root?.unmount()
    environment?.dispose()
    if (model) releaseModel(model)
    gl.dispose()
    gl.forceContextLoss()
    canvas.remove()
  }
  lifetime.addEventListener('abort', stop, { once: true })
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault()
    report('lost')
    stop()
  }, { signal: session.signal })

  try {
    const response = await fetch('/models/vehicle.glb', { signal: session.signal })
    if (!response.ok) throw new Error('Vehicle unavailable')
    const data = await response.arrayBuffer()
    const gltf = await new GLTFLoader().parseAsync(data, '/models/')
    model = gltf.scene
    if (session.signal.aborted) {
      releaseModel(model)
      return
    }
    model.traverse(object => {
      if (object instanceof Mesh) object.castShadow = true
    })
    const bounds = new Box3().setFromObject(model, true)
    const camera = new PerspectiveCamera(32, 1, 0.1, 100)
    const scene = new Scene()
    scene.background = new Color('#292a2d')
    scene.fog = new Fog('#292a2d', 9, 23)
    const room = new RoomEnvironment()
    const generator = new PMREMGenerator(gl)
    try {
      environment = generator.fromScene(room, 0.025, 0.1, 100, { size: 128 })
    } finally {
      generator.dispose()
      room.dispose()
    }
    const size = host.getBoundingClientRect()
    frame(camera, bounds, size.width / size.height)
    root = createRoot(canvas)
    await root.configure({ gl, scene, camera, size, shadows: true, frameloop: 'demand', dpr: [1, 1.5] })
    if (session.signal.aborted) return
    let presented = false
    const store = root.render(<>
      <Environment map={environment.texture} environmentIntensity={0.95} />
      <directionalLight position={[3, 6, 2]} intensity={2.4} color="#fff2d9" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-normalBias={0.015} />
      <primitive object={model} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, bounds.min.y - 0.003, 0]} receiveShadow
        onAfterRender={() => {
          if (!presented && !session.signal.aborted) {
            presented = true
            report('ready')
          }
        }}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333438" roughness={0.84} />
      </mesh>
    </>)
    observer = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect()
      if (width && height) {
        store.getState().setSize(width, height)
        frame(camera, bounds, width / height)
        store.getState().invalidate()
      }
    })
    observer.observe(host)
  } catch {
    if (!session.signal.aborted) {
      stop()
      report('error')
    }
  }
}
