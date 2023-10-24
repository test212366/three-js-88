uniform float time;
uniform float progress;
uniform sampler2D uDots;
uniform sampler2D uStripes;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;


 

void main() {
	float texture1 = texture2D(uDots, vUv).r;
	float texture2 = texture2D(uStripes, vUv).r;
	// vec3 color = vec3(0.136)
 
	gl_FragColor = vec4(vec3(texture1), 1.);
}