# intersect-and-manipulate component
[A-Frame VR](https://aframe.io/) component to select and manipulate objects in scene.

This component uses [A-Frame raycaster](https://github.com/aframevr/aframe/blob/master/docs/components/raycaster.md)
and [aframe-leap-hands](https://github.com/openleap/aframe-leap-hands/blob/master/README.md)
 to allow users to select, with a pose recognition, marked objects in scene and manipulate them using transform controls.

The recognized pose is the gesture of Spider Man, a metaphor to intersect objects.
 
When the pose is detected, this component draws a ray using [aframe-meshline](https://github.com/andreasplesch/aframe-meshline-component)
that intersects the pointed object.

The selected object is moved in front of camera using [aframe-alongpath](https://github.com/protyze/aframe-alongpath-component)
 and the transform control is attached to it.
 
![Example1](/gif1.gif)![Example2](/gif.gif)
 
## Properties
| Property | Default    | Description                                                                     |
|----------|------------|---------------------------------------------------------------------------------|
| hand     | right      | Hand that triggers pose recognition, one of `left`, `right`                     |
| control  | translate  | Control type attached to selected object, one of `translate`, `scale`, `rotate` |
| tag      | selectable | Tag used to mark selectable objects                                             |

## Usage
```html
<head>
    <title>Hello, WebVR! - A-Frame</title>
    <script src="https://aframe.io/releases/0.8.0/aframe.min.js"></script>
    <script src="js/script.js"></script>
</head>
<body>
    <a-scene>
    <!-- Set hands and control as children of camera !-->
        <a-entity camera="near: 0.01" look-controls position="0 1.5 0">
            <a-entity leap-hand="hand: left; holdDistance: 0.5"></a-entity>
            <a-entity leap-hand="hand: right; holdDistance: 0.5"></a-entity>
            <a-entity intersect-and-manipulate></a-entity>
        </a-entity>
    </a-scene>
</body>
```
### More...
[More examples on Glitch](https://mycomponent-examples.glitch.me/)
