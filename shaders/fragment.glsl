uniform float time;
uniform float progress;
uniform sampler2D uNormals;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vPosition;
float PI = 3.1415926;


 

void main() {


	vec3 color = vec3(0.136, .559, .832);


	vec2 st = gl_PointCoord.xy;
	float disc = length(st - vec2(.5));
	float alpha = smoothstep(.5, .48, disc);




	vec4 normalTexture = texture2D(uNormals, st);

	vec3 normal = vec3(normalTexture.rg * 2. - 1., 0.);
	normal.z = sqrt(1. - normal.x * normal.x - normal.y * normal.y);

	normal = normalize(normal);

	vec3 ligthPos = vec3(1.,1.,1.);
	float diffuse = max(0., dot(normal, normalize(ligthPos)));

	vec3 color1 = vec3(.579, .903, .983);


 
	gl_FragColor = vec4(color1, alpha * diffuse * 0.5);
}