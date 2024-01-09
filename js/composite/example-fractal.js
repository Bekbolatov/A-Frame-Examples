var SPEED_MULT = 1.0;
var LAST_TICK = 0.0;
var SIM_CLOCK = 0.0;

AFRAME.registerShader('mandlebrot', {
  schema:
  {
    timeMsec:    {type: 'time',  is: 'uniform'},
    tex:         {type: 'map',   is: 'uniform'},
  },

  vertexShader: `
  varying vec2 vUv;

  void main()
  {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `,

  fragmentShader: `
  varying vec2 vUv;
  uniform sampler2D tex;
  uniform float timeMsec;

  void main()
  {
    vec2 c = 2.0 * (vUv - 0.5) - vec2(0.5, 0);
    vec2 v = vec2(0,0);
    float m = 0.0;
    const float r = 5.0;

    for (int n = 0; n < 128; ++n)
    {
      v = vec2(v.x * v.x - v.y * v.y, v.x * v.y * 2.0) + c;

      // measure how quickly point escapes
      if (dot(v, v) < (r * r - 1.0))
      {
        m++;
      }

      v = clamp(v, -r, r);
    }

    if (m > 127.0)
      gl_FragColor = vec4(0.06, 0, 0.125, 0.80);
    else
      gl_FragColor = texture2D(tex, vec2(0, 1.0 - m / 128.0));
  }
  `,
});

AFRAME.registerShader('julia', {
  schema:
  {
    timeMsec:    {type: 'time',  is: 'uniform'},
    tex:         {type: 'map',   is: 'uniform'},
    c:           {type: 'vec2',  is: 'uniform', default: {x:0.0, y:0.0}},
  },

  vertexShader: `
  varying vec2 vUv;

  void main()
  {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
  `,

  fragmentShader: `
  varying vec2 vUv;
  uniform vec2 c;
  uniform sampler2D tex;
  uniform float timeMsec;

  void main()
  {
    vec2 v = 3.0 * (vUv - 0.5) - vec2(0, 0);
    float m = 0.0;
    const float r = 5.0;

    for (int n = 0; n < 128; ++n)
    {
      v = vec2(v.x * v.x - v.y * v.y, v.x * v.y * 2.0) + c;

      // measure how quickly point escapes
      if (dot(v, v) < (r * r - 1.0))
      {
        m++;
      }

      v = clamp(v, -r, r);
    }

    if (m > 127.0)
      gl_FragColor = vec4(0.06, 0, 0.125, 0.80);
    else
      gl_FragColor = texture2D(tex, vec2(0, 1.0 - m / 128.0));
  }
  `,
});

AFRAME.registerComponent("c-mover", {

  init: function()
  {
      this.clock = new THREE.Clock();
      this.sphere = document.getElementById("cSphere");
      this.juliaPlane = document.getElementById("julia-plane");
  },

  tick: function()
  {
      let amplitude = 0.7;
      let speedMult = 0.1 * window.SPEED_MULT;

      this.clock.getDelta();
      let new_tick = this.clock.elapsedTime;

      let time = this.clock.elapsedTime - window.LAST_TICK;
      window.LAST_TICK = new_tick;

      window.SIM_CLOCK = window.SIM_CLOCK + speedMult*time;

//      let x = amplitude * Math.sin(1.32 * time * speedMult);
//      let y = amplitude * Math.cos(1.00 * time * speedMult);
      let x = amplitude * Math.sin(1.32 * window.SIM_CLOCK);
      let y = amplitude * Math.cos(1.00 * window.SIM_CLOCK);

      this.sphere.object3D.position.set(x,y,0);

      this.juliaPlane.object3D.children[0].material.uniforms.c.value.set(x - 0.5, y); // -0.5: mandlebrot image shifted left
  },

});

AFRAME.registerComponent('left-trigger-logging',{
  init: function () {
    this.el.addEventListener('triggerdown', this.logTriggerdown);
  },
  logTriggerdown: function (evt) {
	window.SPEED_MULT = window.SPEED_MULT * 0.5;
  }
});

	AFRAME.registerComponent('right-trigger-logging',{
  init: function () {
    this.el.addEventListener('triggerdown', this.logTriggerdown);
  },
  logTriggerdown: function (evt) {
	window.SPEED_MULT = window.SPEED_MULT * 2.0;
  }
});
