import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'

interface WorldSceneProps {
  entered: boolean
}

export default function WorldScene({ entered }: WorldSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<number | null>(null)
  const enteredRef = useRef(entered)

  useEffect(() => {
    enteredRef.current = entered
  }, [entered])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog('#eef4f9', 8, 22)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
    camera.position.set(0, 0.4, 9.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.9)
    const key = new THREE.DirectionalLight(0x9ac4ff, 0.6)
    key.position.set(4, 6, 4)
    scene.add(ambient, key)

    const globeGroup = new THREE.Group()
    scene.add(globeGroup)

    const dotMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#5aa5e4'),
      size: 0.026,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true,
    })

    const glowMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#b8dcff'),
      size: 0.022,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true,
    })

    const loader = new GLTFLoader()
    let pointsMesh: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null
    let glowMesh: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial> | null = null
    let scatterPositions: Float32Array | null = null
    let targetPositions: Float32Array | null = null
    let assembleProgress = enteredRef.current ? 1 : 0.45
    let assembleStart: number | null = null
    let zoomProgress = enteredRef.current ? 1 : 0
    let zoomStart: number | null = null

    loader.load('/Animation/world.gltf', (gltf: GLTF) => {
      const mesh = gltf.scene.getObjectByProperty('type', 'Mesh') as THREE.Mesh |
        undefined
      if (!mesh || !(mesh.geometry instanceof THREE.BufferGeometry)) {
        return
      }

      const geometry = mesh.geometry.clone()
      geometry.center()
      geometry.scale(1.9, 1.9, 1.9)

      const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build()
      const sampleCount = 18000
      targetPositions = new Float32Array(sampleCount * 3)
      scatterPositions = new Float32Array(sampleCount * 3)
      const tempPosition = new THREE.Vector3()

      for (let i = 0; i < sampleCount; i += 1) {
        sampler.sample(tempPosition)
        targetPositions[i * 3] = tempPosition.x
        targetPositions[i * 3 + 1] = tempPosition.y
        targetPositions[i * 3 + 2] = tempPosition.z

        const radius = 5 + Math.random() * 6
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        scatterPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
        scatterPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
        scatterPositions[i * 3 + 2] = radius * Math.cos(phi)
      }

      const pointsGeometry = new THREE.BufferGeometry()
      pointsGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(scatterPositions, 3)
      )

      pointsMesh = new THREE.Points(pointsGeometry, dotMaterial)
      glowMesh = new THREE.Points(pointsGeometry.clone(), glowMaterial)
      globeGroup.add(pointsMesh, glowMesh)
    })

    const dustGeometry = new THREE.BufferGeometry()
    const dustPositions: number[] = []
    for (let i = 0; i < 600; i += 1) {
      const radius = 5 + Math.random() * 6
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      dustPositions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      )
    }
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3))
    const dustMaterial = new THREE.PointsMaterial({
      color: new THREE.Color('#cfe6fb'),
      size: 0.02,
      transparent: true,
      opacity: 0.4,
    })
    const dust = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dust)

    const clock = new THREE.Clock()

    const animate = () => {
      const elapsed = clock.getElapsedTime()
      globeGroup.rotation.y = elapsed * 0.12
      globeGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.06
      dust.rotation.y = -elapsed * 0.03
      if (enteredRef.current && zoomProgress < 1) {
        const start = zoomStart ?? (zoomStart = elapsed)
        const t = Math.min((elapsed - start) / 2.4, 1)
        zoomProgress = t
      } else if (!enteredRef.current) {
        zoomProgress = 0
        zoomStart = null
      }
      const zoomScale = THREE.MathUtils.lerp(2.25, 1, zoomProgress)
      const aspect = Math.max(camera.aspect, 0.6)
      const widthClamp = aspect < 1 ? aspect + 0.15 : 1
      globeGroup.scale.setScalar(zoomScale * widthClamp)

      if (pointsMesh && glowMesh && targetPositions && scatterPositions) {
        if (enteredRef.current && assembleProgress < 1) {
          const start = assembleStart ?? (assembleStart = elapsed)
          const t = Math.min((elapsed - start) / 2.2, 1)
          assembleProgress = t
        } else if (!enteredRef.current) {
          assembleProgress = 0.45
        }

        const positionAttr = pointsMesh.geometry.getAttribute('position') as THREE.BufferAttribute
        const glowAttr = glowMesh.geometry.getAttribute('position') as THREE.BufferAttribute
        const count = positionAttr.count
        const drift = enteredRef.current ? 0.002 : 0.006

        for (let i = 0; i < count; i += 1) {
          const idx = i * 3
          const sx = scatterPositions[idx]
          const sy = scatterPositions[idx + 1]
          const sz = scatterPositions[idx + 2]
          const tx = targetPositions[idx]
          const ty = targetPositions[idx + 1]
          const tz = targetPositions[idx + 2]

          const x = THREE.MathUtils.lerp(sx, tx, assembleProgress)
          const y = THREE.MathUtils.lerp(sy, ty, assembleProgress)
          const z = THREE.MathUtils.lerp(sz, tz, assembleProgress)

          scatterPositions[idx] += drift * 0.3
          scatterPositions[idx + 1] += drift * 0.12

          positionAttr.setXYZ(i, x, y, z)
          glowAttr.setXYZ(i, x, y, z)
        }

        positionAttr.needsUpdate = true
        glowAttr.needsUpdate = true
      }

      renderer.render(scene, camera)
      frameRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      const { clientWidth, clientHeight } = container
      camera.aspect = clientWidth / clientHeight
      const baseZ = 9.5
      const aspect = Math.max(camera.aspect, 0.6)
      const zoomOut = aspect < 1 ? (1 - aspect) * 4.5 : 0
      camera.position.z = baseZ + zoomOut
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)

      dustGeometry.dispose()
      dustMaterial.dispose()
      dotMaterial.dispose()
      glowMaterial.dispose()
      pointsMesh?.geometry.dispose()
      glowMesh?.geometry.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="absolute inset-0" />
}
