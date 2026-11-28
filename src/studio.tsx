import gsap from 'gsap'
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
import type { StoryProgress } from './storyProgress'

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
function frame(camera: PerspectiveCamera, box: Box3, aspect: number, progress: number, viewDirection?: Vector3) {
  const center = box.getCenter(new Vector3())
  const direction = viewDirection ?? new Vector3(0.7 + 0.32 * (1 - progress), 0.32 - 0.06 * (1 - progress), 1)
  direction.normalize()
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
  camera.position.copy(center).addScaledVector(direction, distance * (1 + 0.08 * (1 - progress)))
  camera.lookAt(center)
  camera.updateProjectionMatrix()
}

// The two lamps share a mesh. Select near-side vertices after the GLB's root transform.
function storyShots(model: Object3D, bounds: Box3) {
  const wheel = model.getObjectByName('WheelFrontR')
  const lamps = model.getObjectByName('BodyHeadlights')
  if (!wheel || !(lamps instanceof Mesh)) throw new Error('Vehicle detail geometry unavailable')
  const wheelBox = new Box3().setFromObject(wheel, true)
  const lampBox = new Box3()
  const point = new Vector3()
  const vertices = lamps.geometry.getAttribute('position')
  const middle = bounds.getCenter(new Vector3()).z
  for (let i = 0; i < vertices.count; i++) {
    point.fromBufferAttribute(vertices, i).applyMatrix4(lamps.matrixWorld)
    if (point.z > middle) lampBox.expandByPoint(point)
  }
  if (lampBox.isEmpty()) throw new Error('Near-side lamp geometry unavailable')
  // Include the fender and hood around the details for orientation.
  const wheelHeight = wheelBox.max.y - wheelBox.min.y
  return [
    { box: bounds, direction: new Vector3(0.7, 0.32, 1), light: 0.95 },
    { box: wheelBox.expandByScalar(wheelHeight * 0.25), direction: new Vector3(0.22, 0.18, 1), light: 0.78 },
    { box: lampBox.expandByScalar(wheelHeight * 0.42), direction: new Vector3(1, 0.48, 0.75), light: 1.13 },
  ] as const
}

export async function mountStudio(host: HTMLElement, lifetime: AbortSignal, report: (state: StageState) => void, skip?: AbortSignal, story?: StoryProgress) {
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
  let reveal: gsap.core.Tween | undefined
  let revealFrame = 0
  let unsubscribeStory: (() => void) | undefined
  const stop = () => {
    if (session.signal.aborted) return
    session.abort()
    lifetime.removeEventListener('abort', stop)
    cancelAnimationFrame(revealFrame)
    unsubscribeStory?.()
    reveal?.kill()
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
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const shots = storyShots(model, bounds)
    let position = preference.matches ? 0 : story?.get() ?? 0
    const motion = { progress: position > 0 || preference.matches || skip?.aborted || document.hidden ? 1 : 0 }
    let aspect = size.width / size.height
    const target = new Box3()
    const direction = new Vector3()
    function compose() {
      const description = position < 0.25 ? 'Three-quarter studio view of the vehicle' :
        position < 0.75 ? 'Front wheel and fender detail' : 'Front headlamp and hood detail'
      if (canvas.getAttribute('aria-label') !== description) canvas.setAttribute('aria-label', description)
      if (position === 0) {
        frame(camera, bounds, aspect, motion.progress)
        scene.environmentIntensity = 0.42 + 0.53 * motion.progress
        return
      }
      const [from, to] = position <= 0.5 ? [shots[0], shots[1]] : [shots[1], shots[2]]
      const t = position <= 0.5 ? 2 * position : 2 * position - 1
      const mix = t * t * (3 - 2 * t)
      target.min.copy(from.box.min).lerp(to.box.min, mix)
      target.max.copy(from.box.max).lerp(to.box.max, mix)
      direction.copy(from.direction).lerp(to.direction, mix)
      frame(camera, target, aspect, 1, direction)
      scene.environmentIntensity = from.light + (to.light - from.light) * mix
    }
    compose()
    root = createRoot(canvas)
    await root.configure({ gl, scene, camera, size, shadows: true, frameloop: 'demand', dpr: [1, 1.5] })
    if (session.signal.aborted) return
    let presented = false
    const store = root.render(<>
      <Environment map={environment.texture} environmentIntensity={scene.environmentIntensity} />
      <directionalLight position={[3, 6, 2]} intensity={2.4} color="#fff2d9" castShadow
        shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-normalBias={0.015} />
      <primitive object={model} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, bounds.min.y - 0.003, 0]} receiveShadow
        onAfterRender={() => {
          if (!presented && !session.signal.aborted) {
            presented = true
            if (motion.progress === 1) report('ready')
            else {
              reveal = gsap.to(motion, {
                progress: 1, duration: 1.45, ease: 'power2.inOut', paused: true,
                onUpdate: () => {
                  compose()
                  store.getState().invalidate()
                },
                onComplete: () => {
                  cancelAnimationFrame(revealFrame)
                  report('ready')
                },
              })
              // Seek by elapsed time so sparse GPU frames retain the intended shot duration.
              const shot = reveal
              let started: number | undefined
              const advance = () => {
                if (session.signal.aborted) return
                const now = performance.now()
                if (started === undefined) {
                  // The first GPU submission can block before the browser presents it.
                  started = now
                  report('revealing')
                }
                shot.time((now - started) / 1000)
                if (shot.progress() < 1) revealFrame = requestAnimationFrame(advance)
              }
              revealFrame = requestAnimationFrame(advance)
            }
          }
        }}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333438" roughness={0.84} />
      </mesh>
    </>)
    const settle = () => {
      if (reveal ? reveal.progress() === 1 : motion.progress === 1) return
      reveal?.progress(1)
      motion.progress = 1
      compose()
      store.getState().invalidate()
    }
    const seek = () => {
      const next = preference.matches ? 0 : story?.get() ?? 0
      if (next === position) return
      // Settle the elapsed-time reveal before scroll takes permanent camera ownership.
      settle()
      position = next
      compose()
      store.getState().invalidate()
    }
    const options = { signal: session.signal }
    preference.addEventListener('change', () => { settle(); seek() }, options)
    skip?.addEventListener('abort', settle, options)
    document.addEventListener('visibilitychange', settle, options)
    if (skip?.aborted || preference.matches || document.hidden) settle()
    unsubscribeStory = story?.subscribe(seek)
    seek()
    observer = new ResizeObserver(() => {
      const { width, height } = host.getBoundingClientRect()
      if (width && height) {
        store.getState().setSize(width, height)
        aspect = width / height
        compose()
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
