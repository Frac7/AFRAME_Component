# animate component
[A-Frame VR](https://aframe.io/) component to animate objects in scene.

This component wraps [aframe-animation-component](https://github.com/ngokevin/kframe/tree/master/components/animation) in
order to simplify way to animate objects for users without any animation knowledge.

This component uses the intersect-and-manipulate component to select objects to animate (must be included in scene).

In editing mode, user have to create trajectory for object animation. Once trajectory is created,
user can manipulate properties of the target object (with GUI/transform controls) and save the key frame.

In animation mode user can play, stop and resume animation.
 
## Properties
| Property     | Default    | Description                                                                                            |
|--------------|------------|--------------------------------------------------------------------------------------------------------|
| editMode     | true       | Enable or disable animation editor                                                                     |
| property     | ' '        | Propery to animate for each key frame, one of `material.color`, `material.opacity`, `scale`, `rotation`|
| value        | ' '        | Value to assign to property (to value)                                                                 |
| interpolation| 'linear'   | Function that defines the animation between key frames (realistic animation)                           |
| repeat       | '1'        | How many times animation is repeated (use `infinite` to repeat infinitely)                             |
| duration     | 5000       | How long each frame of animation lasts                                                                 |
| delay        | 0          | How much to wait before each frame of animation starts                                                 |

## Usage
```html
<head>
    <title>Hello, WebVR! - A-Frame</title>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
    <script src="js/script.js"></script>
    <script src="js/gestioneAnimazioni.js"></script>
</head>
<body>
    <a-scene>
    <!-- Set hands and control as children of camera !-->
        <a-entity camera="near: 0.01" look-controls position="0 1.5 0">
            <a-entity leap-hand="hand: left; holdDistance: 0.5"></a-entity>
            <a-entity leap-hand="hand: right; holdDistance: 0.5"></a-entity>
            <a-entity intersect-and-manipulate></a-entity>
            <a-entity animate></a-entity>
        </a-entity>
    </a-scene>
</body>
```
<!-- inserire il codice per l'editor !-->
### More...
[More examples on Glitch](https://mycomponent-tutorial.glitch.me/)
[aframe-text-geometry](https://github.com/ngokevin/kframe/tree/master/components/text-geometry)

<!-- descrizione !-->
### Easing functions
* Linear
    * `linear`
* Quadratic:
    * `easeInQuad`
    * `easeOutQuad`
    * `easeInOutQuad`
* Cubic
    * `easeInCubic`
    * `easeOutCubic`
    * `easeInOutCubic`
* Quartic
    * `easeInQuart`
    * `easeOutQuart`
    * `easeInOutQuart`
* Quintic
    * `easeInQuint`
    * `easeOutQuint`
    * `easeInOutQuint`
* Sine
    * `easeInSine`
    * `easeOutSine`
    * `easeInOutSine`
* Exponential
    * `easeInExpo`
    * `easeOutExpo`
    * `easeInOutExpo`
* Circular
    * `easeInCirc`
    * `easeOutCirc`
    * `easeInOutCirc`
* Back
    * `easeInBack`
    * `easeOutBack`
    * `easeInOutBack`
* Elastic
    * `easeInElastic`
    * `easeOutElastic`
    * `easeInOutElastic`
