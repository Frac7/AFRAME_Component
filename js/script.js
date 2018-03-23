//true se si è verificato l'evento "intersezione"
var flag = false;
AFRAME.registerComponent('componente', {
        //raycaster (dipendenza dal componente a-frame)
        dependencies: ['raycaster'],
        schema: {},

        init: function () {
            var origin = this.el.getAttribute('raycaster').origin;
            this.el.setAttribute('raycaster', {
                //evitare collisioni con la camera o con il raggio stesso
                near: 0.05,
                //lunghezza del raggio
                far: 0.05
            });
            /*definizione di diversi event listener: le entità inserite nell'html dinamicamente hanno bisogno
              di essere caricate per poter assegnare degli attributi*/
            //definizione del percorso. il percorso viene creato con un componente esterno per a-frame
            //#1 curva
            var curve = document.createElement('a-curve');
            curve.setAttribute('id','curve');
            document.querySelector('a-scene').appendChild(curve);
            curve.addEventListener('loaded',function() {
                //#2 punti (figli)
                var child0 = document.createElement('a-curve-point');
                child0.setAttribute('id','punto0');
                child0.setAttribute('position', '0 0 0');
                curve.appendChild(child0);

                /*
                var child1 = document.createElement('a-curve-point');
                child1.setAttribute('id','punto1');
                //child1: posizione dell'elemento
                child1.setAttribute('position', '0 0 0');
                curve.appendChild(child1);*/

                var child2 = document.createElement('a-curve-point');
                child2.setAttribute('id','punto2');
                //child2: "origine"
                child2.setAttribute('position', '0 0 0');
                curve.appendChild(child2);
            });
            //creazione meshline
            var meshLine = document.createElement('a-entity');
            meshLine.setAttribute('id', 'ml');
            //aggiunta meshline alla scena
            this.el.appendChild(meshLine);
            //event listener: il raggio ha intersecato qualcosa
            /*nel momento in cui un oggetto viene intersecato dal raggio, viene creato un percorso che parte dalla posizione
            * dell'oggetto e arriva alla posizione della camera (posizione dell'utente) e l'oggetto intersecato segue questo
            * percorso*/
            this.el.addEventListener('raycaster-intersection', function (event) {
                flag = true;
                //oggetto intersecato
                var intersectedObject = event.detail.els[0];
                //mano visibile
                var isVisible = document.querySelector('#rh').components["leap-hand"].isVisible;
                //se l'elemento intersecato non è una mano (e nemmeno il piano)
                if (isVisible && intersectedObject.getAttribute('leap-hand') == null && intersectedObject !== document.querySelector('a-plane')) {
                    //posizioni elemento intersecato e camera per successiva definizione del percorso
                    var endPath = intersectedObject.getAttribute('position');
                    //var middle = ((endPath.x+origin.x)/2)+' '+((endPath.y+origin.y)/2)+' '+((endPath.z+origin.z)/2);
                    document.querySelector('#punto0').setAttribute('position', endPath);
                    //document.querySelector('#punto0').setAttribute('position', middle);
                    var p2 = {
                        x: origin.x,
                        y: origin.y + 1,
                        z: origin.z - 3
                    };
                    document.querySelector('#punto2').setAttribute('position', p2);
                    intersectedObject.setAttribute('alongpath', {
                        curve: '#curve',
                        delay: 1500
                    });

                    intersectedObject.addEventListener('movingended', function() {
                        var scene = document.querySelector('a-scene');
                        var sphere = document.querySelector('a-sphere').components;
                        //three js cameras
                        var camera = document.querySelector('#camera').components["camera"].camera;
                        var control = new THREE.TransformControls( camera, document.querySelector('.a-canvas'));
                        //scale, rotate, translate
                        control.setSize( control.size + 1 );
                        control.setMode('translate');
                        //three js sphere
                        control.attach(sphere.geometry.el.object3D);
                        scene.object3D.add(control);
                    });


                }
            });
            this.el.addEventListener('raycaster-intersection-cleared', function (event) {
                flag = false;
            });
        },
        update: function (oldData) {

        },
        tick: function () {

            var hand = document.querySelector('#rh').components["leap-hand"].getHand();
            //informazioni LeapMotion SDK
            if(hand !== null && hand !== undefined && hand.pointables.length !== 0)
            {
                //posizione del palmo e riconoscimento gesto
                if(hand.palmNormal[1] <= 0 && hand.pointables[0].extended && hand.pointables[1].extended && (!hand.pointables[2].extended) && (!hand.pointables[3].extended) && hand.pointables[4].extended)
                {
                    this.el.setAttribute('raycaster', {
                        //lunghezza del raggio
                        far: 10
                    });
                    //hand raycaster
                    //var origin = document.querySelector('#lh').components["leap-hand"].intersector.raycaster.ray.origin;
                    var origin = document.querySelector('#rh').components["leap-hand"].intersector.raycaster.ray.origin;
                    //posizione camera per successivo calcolo posizione relativa (figli della camera)
                    var cameraPosition = this.el.parentNode.getAttribute('position');
                    //posizione relativa per raycaster (figlio della camera)
                    var relativeOriginPosition = (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + (origin.z - cameraPosition.z);
                    //percorso meshline relativo
                    var path = (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + (origin.z - cameraPosition.z) + ', ' + (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + ((origin.z - cameraPosition.z) - this.el.getAttribute('raycaster').far);

                    var p = this.el.getAttribute('position');
                    var pathChild = (origin.x - cameraPosition.x - p.x) + ' ' + (origin.y - cameraPosition.y - p.y) + ' ' + (origin.z - cameraPosition.z - p.z) + ', ' + (origin.x - cameraPosition.x - p.x) + ' ' + (origin.y - cameraPosition.y - p.y) + ' ' + ((origin.z - cameraPosition.z - p.z) - this.el.getAttribute('raycaster').far);

                    //modifica del raycaster del componente con posizione della mano (coincide con la mesh)
                    this.el.setAttribute('raycaster', {
                        showLine: true,
                        origin: relativeOriginPosition
                    });
                    this.el.setAttribute('line', {
                        end: path.split(', ')[1]
                    });

                    if(flag)
                    {
                        this.el.setAttribute('line', {
                            color: '#74BEC1'
                        });
                        document.querySelector('#ml').setAttribute('meshline', {
                            lineWidth: 20,
                            path: pathChild,
                            color: '#74BEC1',
                            lineWidthStyler: '1 - p'
                        });
                    }
                    else
                    {
                        this.el.setAttribute('line', {
                            color: '#FFFFFF'
                        });
                        document.querySelector('#ml').setAttribute('meshline', {
                            lineWidth: 20,
                            path: pathChild,
                            color: '#FFFFFF',
                            lineWidthStyler: '1 - p'
                        });
                    }
                }
                else
                {
                    this.el.setAttribute('raycaster', {
                        showLine: false
                    });
                    document.querySelector('#ml').setAttribute('meshline', {
                        lineWidth: 0,
                        path: '0 0 0, 0 0 0'
                    });
                }
            }
        },

        remove: function () {
            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }
            this.el.parentNode.removeChild(this.el);
        }
    }
);
