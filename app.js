import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader' 
import GUI from 'lil-gui'
import gsap from 'gsap'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertexParticles.glsl'
 
import fragmentTube from './shaders/fragmentTube.glsl'
import vertexTube from './shaders/vertexTube.glsl'

import dots from './dots.png'
import stripe from './stripes.png'

import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'
import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'

import normals from './meo.png'

export default class Sketch {
	constructor(options) {
		
		this.scene = new THREE.Scene()
		
		this.container = options.dom
		
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		
		
		// // for renderer { antialias: true }
		this.renderer = new THREE.WebGLRenderer({ antialias: true })
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height)
		this.renderer.setSize(this.width ,this.height )
		this.renderer.setClearColor(0x05233c, 1)
		this.renderer.useLegacyLights = true
		this.renderer.outputEncoding = THREE.sRGBEncoding
 

		 
		this.renderer.setSize( window.innerWidth, window.innerHeight )

		this.container.appendChild(this.renderer.domElement)
 


		this.camera = new THREE.PerspectiveCamera( 70,
			 this.width / this.height,
			 0.01,
			 10
		)
 
		this.camera.position.set(0, 0, 2) 
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.time = 0


		this.dracoLoader = new DRACOLoader()
		this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
		this.gltf = new GLTFLoader()
		this.gltf.setDRACOLoader(this.dracoLoader)

		this.isPlaying = true

		this.addObjects()		 
		this.resize()
		this.render()
		this.setupResize()

 
	}

	settings() {
		let that = this
		this.settings = {
			progress: 0
		}
		this.gui = new GUI()
		this.gui.add(this.settings, 'progress', 0, 1, 0.01)
	}

	setupResize() {
		window.addEventListener('resize', this.resize.bind(this))
	}

	resize() {
		this.width = this.container.offsetWidth
		this.height = this.container.offsetHeight
		this.renderer.setSize(this.width, this.height)
		this.camera.aspect = this.width / this.height


		this.imageAspect = 853/1280
		let a1, a2
		if(this.height / this.width > this.imageAspect) {
			a1 = (this.width / this.height) * this.imageAspect
			a2 = 1
		} else {
			a1 = 1
			a2 = (this.height / this.width) / this.imageAspect
		} 


		this.material.uniforms.resolution.value.x = this.width
		this.material.uniforms.resolution.value.y = this.height
		this.material.uniforms.resolution.value.z = a1
		this.material.uniforms.resolution.value.w = a2

		this.camera.updateProjectionMatrix()



	}


	addObjects() {
		let that = this
		this.material = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()},
				uNormals: {value: new THREE.TextureLoader().load(normals)}
			},
			vertexShader,
			fragmentShader,
			transparent: true,
			depthTest: false,
		})
		let number = 10000
		this.geometry = new THREE.BufferGeometry()
		this.positions = new Float32Array(number * 3)
		this.randoms = new Float32Array(number * 3)
		this.sizes = new Float32Array(number)


		for (let i = 0; i < number * 3; i+=3) {
			this.positions[i + 0] = (Math.random() - 0.5)
			this.positions[i + 1] = (Math.random() - 0.5)
			this.positions[i + 2] = (Math.random() - 0.5)

			this.randoms[i + 0] = Math.random()
			this.randoms[i + 1] = Math.random()
			this.randoms[i + 2] = Math.random()

			this.sizes[i + 0] = 0.5 + 0.5 * Math.random()

		}

		this.geometry.setAttribute(
			'position',
			new THREE.BufferAttribute(this.positions, 3)
		)

		this.geometry.setAttribute(
			'aRandom',
			new THREE.BufferAttribute(this.randoms, 3)
		)
		
		this.geometry.setAttribute(
			'size',
			new THREE.BufferAttribute(this.sizes, 1)
		)

 
		this.plane = new THREE.Points(this.geometry, this.material)
 
		this.scene.add(this.plane)

 

		let points = []


		for (let i = 0; i <= 100; i++) {
			let angle = 2 * Math.PI * i / 100
			let x = Math.sin(angle) + 2. * Math.sin(2. * angle)
			let y = Math.cos(angle) - 2. * Math.cos(2. * angle)
			let z = -Math.sin(3. * angle)
 
			points.push(new THREE.Vector3(x,y,z))
			
		}
 
		let curve = new THREE.CatmullRomCurve3(points)
		this.tubeGeo = new THREE.TubeGeometry(curve, 100, 0.2, 100, true)

		let dotsTexture = new THREE.TextureLoader().load(dots)
		let stripeTexture = new THREE.TextureLoader().load(stripe)

		dotsTexture.wrapS = THREE.RepeatWrapping
		dotsTexture.wrapT = THREE.RepeatWrapping

		stripeTexture.wrapS = THREE.RepeatWrapping
		stripeTexture.wrapT = THREE.RepeatWrapping



		this.tubeMaterial = new THREE.ShaderMaterial({
			extensions: {
				derivatives: '#extension GL_OES_standard_derivatives : enable'
			},
			side: THREE.DoubleSide,
			uniforms: {
				time: {value: 0},
				resolution: {value: new THREE.Vector4()},
				uDots: {value: dotsTexture},
				uStripes: {value: stripeTexture}
			},
			vertexShader: vertexTube,
			fragmentShader: fragmentTube,
			transparent: true
 
		})
		this.tube = new THREE.Mesh(this.tubeGeo, this.tubeMaterial)
		this.scene.add(this.tube)
	}



	addLights() {
		const light1 = new THREE.AmbientLight(0xeeeeee, 0.5)
		this.scene.add(light1)
	
	
		const light2 = new THREE.DirectionalLight(0xeeeeee, 0.5)
		light2.position.set(0.5,0,0.866)
		this.scene.add(light2)
	}

	stop() {
		this.isPlaying = false
	}

	play() {
		if(!this.isPlaying) {
			this.isPlaying = true
			this.render()
		}
	}

	render() {
		if(!this.isPlaying) return
		this.time += 0.05
		// this.material.uniforms.time.value = this.time
		// if(this.tubeMaterial) this.tubeMaterial.uniforms.time.value = this.time
		
		//this.renderer.setRenderTarget(this.renderTarget)
		this.renderer.render(this.scene, this.camera)
		
		//this.renderer.setRenderTarget(null)
 
		requestAnimationFrame(this.render.bind(this))
	}
 
}
new Sketch({
	dom: document.getElementById('container')
})
 