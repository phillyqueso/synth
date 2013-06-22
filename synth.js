var volume = 0.4;
var wave1 = 0;
var detune1 = 0;

var wave2 = 0;
var detune2 = 0;

var wave3 = 0;
var detune3 = 0;

var attack = 0.003;

$(function () {
  var context = new AudioContext();

  var keyboard = qwertyHancock({
    id: 'keyboard',
    width: 725,
    height: 250,
    octaves: 2,
    startNote: 'C3',
    whiteNotesColour: 'white',
    blackNotesColour: 'black',
    hoverColour: '#FFEFD5'
  });

  $("#masterVolume").knobKnob({
    snap : 10,          // Snap to zero if less than this deg.
    value: (volume * 100),         // Default rotation
    turn : function(newVolume) {
      volume = newVolume;
      console.log("volume: "+ volume);
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vca.gain.value = volume;
      });
    }
  });
  
  $("#attack").knob({
    min: 0,
    max: 1000,
    width: "60",
    change: function(val) {
      attack = (val / 1000);
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.compressor.attack = attack;
      });
    }
  });
  
    
  $("#osc1-wave").knob({
    min: 0,
    max: 4,
    width: "60",
    change: function(val) {
      wave1 = val;
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco1.type = wave1;
      });
    }
  });

  $("#osc1-detune").knob({
    min: -4800,
    max: 4800,
    step: 50,
    width: "60",
    change: function(val) {
      detune1 = (val / 100)
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco1.detune.value = detune1;
      });
    }
  });
  
  $("#osc2-wave").knob({
    min: 0,
    max: 4,
    width: "60",
    change: function(val) {
      wave2 = val;
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco2.type = wave2;
      });
    }
  });


  $("#osc2-detune").knob({
    min: -4800,
    max: 4800,
    step: 50,
    width: "60",
    change: function(val) {
      detune2 = (val / 100)
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco2.detune.value = detune2;
      });
    }
  });
  
  $("#osc3-wave").knob({
    min: 0,
    max: 4,
    width: "60",
    change: function(val) {
      wave1 = val;
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco3.type = wave3;
      });
    }
  });

  $("#osc3-detune").knob({
    min: -4800,
    max: 4800,
    step: 50,
    width: "60",
    change: function(val) {
      detune1 = (val / 100)
      _.each(active_voices, function(voice) {
        if (voice.active)
          voice.node.vco3.detune.value = detune3;
      });
    }
  });


  var Voice = (function(context) {
    function Voice(frequency) {
      this.frequency = frequency;
      this.node = false;
    };

    Voice.prototype.start = function() {
      this.active = true;
      if (this.node == false) {
        this.node = {};

        /* VCO 1 */
        var vco1 = context.createOscillator();
        vco1.type = wave1;
        vco1.frequency.value = this.frequency;
        vco1.detune.value = detune1;

        /* VCO 2 */
        var vco2 = context.createOscillator();
        vco2.type = wave2;
        vco2.frequency.value = this.frequency;
        vco2.detune.value = detune2;

        /* VCO 3 */
        var vco3 = context.createOscillator();
        vco3.type = wave3;
        vco3.frequency.value = this.frequency;
        vco3.detune.value = detune3;
        
        //var lowpassFilter = context.createBiquadFilter();
        //var waveShaper = context.createWaveShaper();
        //var panner = context.createPanner();
        var compressor = context.createDynamicsCompressor();
        compressor.attack = attack;
        //var reverb = context.createConvolver();

        // Connect final compressor to final destination.
        compressor.connect(context.destination);        

        /* VCA */
        var vca = context.createGain();
        vca.gain.value = volume;

        /* connections */
        vco1.connect(vca);
        vco2.connect(vca);
        vco3.connect(vca);
        vca.connect(compressor);
        
        /* Keep track of the nodes used */
        this.node = {'vco1': vco1, 'vco2': vco2, 'vco3': vco3, 'vca': vca, 'compressor': compressor};
        this.node.vco1.start(0);
        this.node.vco2.start(0);
        this.node.vco3.start(0);
      } else {
        this.node.vco1.type = wave1;
        this.node.vco2.type = wave2;
        this.node.vco3.type = wave3;
        this.node.vco1.detune.value = detune1;
        this.node.vco2.detune.value = detune2;
        this.node.vco3.detune.value = detune3;
        this.node.vca.gain.value = volume;
      }
    };
    
    Voice.prototype.stop = function() {
      this.active = false;
      this.node.vca.gain.value = 0;
    };

    return Voice;
  })(context);

  var active_voices = {};

  keyboard.keyDown(function (note, frequency) {
    console.log(note, frequency);
    var voice = null;
    if (_.keys(active_voices).indexOf(note) == -1) {
      voice = new Voice(frequency);
      active_voices[note] = voice;
    } else {
      voice = active_voices[note];
    }
    voice.start();
  });

  keyboard.keyUp(function (note, _) {
    active_voices[note].stop();
  });
});
