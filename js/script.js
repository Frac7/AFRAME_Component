function selectedHand (hand, document)
{
    var hands = document.querySelectorAll('[leap-hand]');
    if(hands)
    {
        for(var i = 0; i < hands.length; i++)
            if(hands[i].components['leap-hand'] && hands[i].components['leap-hand'].attrValue.hand == hand)
                return hands[i];
    }
}

function gestureRecognizer (hand)
{
    //palmo verso l'alto, tre dita estese e due no (pollice, indice, mignolo estese)
    return (hand && hand.palmNormal[1] >= 0 && hand.pointables[0].extended && hand.pointables[1].extended && (!hand.pointables[2].extended) && (!hand.pointables[3].extended) && hand.pointables[4].extended);
}

function validHand (hand)
{
    return (hand && hand.pointables.length !== 0);
}

function getCamera (scene, document)
{
    if(scene.camera)
        return scene.camera;
    else if(document.querySelector('a-camera'))
        return document.querySelector('a-camera').components["camera"].camera;
    else if(document.querySelector('[camera]'))
        return document.querySelector('[camera]').components["camera"].camera;
    else
        return new THREE.PerspectiveCamera();
}
//true se si è verificato l'evento "intersezione"
var flag = false;
var pp = 0;
AFRAME.registerComponent('componente', {
        //raycaster (dipendenza dal componente a-frame)
        dependencies: ['raycaster'],
        schema: {
            //mano da utilizzare per il raggio
            hand: {type: 'string', default: 'right', oneOf: ['left', 'right']},
            //controllo da gestire per l'oggetto selezionato
            control: {type: 'string', default: 'scale', oneOf: ['translate', 'scale', 'rotate']}
            //TODO: attributo per definire quali oggetti siano selezionabili
        },

        init: function () {
            var origin = this.el.getAttribute('raycaster').origin;
            this.el.setAttribute('raycaster', {
                //evitare collisioni con la camera o con il raggio stesso
                near: 0.05,
                //lunghezza del raggio
                far: 0.05,
            });
            /*definizione di diversi event listener: le entità inserite nell'html dinamicamente hanno bisogno
              di essere caricate per poter assegnare degli attributi*/
            //definizione del percorso. il percorso viene creato con un componente esterno per a-frame
            //#1 curva
            var curve = document.createElement('a-curve');
            curve.setAttribute('id','curve');
            document.querySelector('a-scene').appendChild(curve);
            curve.addEventListener('loaded',function(event) {
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
                curve.appendChild(child1);
                */
                var child2 = document.createElement('a-curve-point');
                child2.setAttribute('id','punto2');
                //child2: "origine"
                child2.setAttribute('position', '0 0 0');
                curve.appendChild(child2);
            });
            //event listener: il raggio ha intersecato qualcosa
            /*nel momento in cui un oggetto viene intersecato dal raggio, viene creato un percorso che parte dalla posizione
            * dell'oggetto e arriva alla posizione della camera (posizione dell'utente) e l'oggetto intersecato segue questo
            * percorso*/
            this.el.addEventListener('raycaster-intersection', function (event) {
                flag = true;
                //oggetto intersecato
                var intersectedObject = event.detail.els[0];
                //mano visibile
                var isVisible = selectedHand(event.srcElement.components['componente'].data.hand, document).components['leap-hand'].isVisible;
                //se l'elemento intersecato non è una mano (e nemmeno il piano) - TODO: integrazione con attributo per raggio nello schema
                ////if (isVisible && intersectedObject.getAttribute('[selezionabile]')) {
                if (isVisible && intersectedObject.getAttribute('leap-hand') == null && intersectedObject !== document.querySelector('a-plane')) {
                    //posizioni elemento intersecato e camera per successiva definizione del percorso
                    var endPath = intersectedObject.getAttribute('position');
                    pp = endPath.z;
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
                    intersectedObject.addEventListener('movingended', function(event) {
                        event.srcElement.removeAttribute('alongpath');
                        //propagazione evento
                        if(!document.querySelector('#transform') || document.querySelector('#transform') === null || document.querySelector('#transform') === undefined)
                        {
                            var scene = document.querySelector('a-scene');
                            //three js cameras
                            var camera = getCamera(scene, document);
                            var control = new THREE.TransformControls( camera, document.querySelector('.a-canvas'));

                            var feedback = document.createElement('a-entity');
                            feedback.setAttribute('id','transform');
                            feedback.setAttribute('holdable','');

                            //scale, rotate, translate
                            control.setSize( control.size + 1 );
                            control.setMode(document.querySelector('[componente]').components['componente'].data.control);
                            //three js object
                            control.attach(event.srcElement.components.geometry.el.object3D);
                            //scene.object3D.add(control);
                            feedback.object3D.add(control);
                            scene.appendChild(feedback);
                            console.log(control);
                        }
                    });
                }
            });
            this.el.addEventListener('raycaster-intersection-cleared', function (event) {
                flag = false;
            });
        },

        tick: function () {
            //document.querySelector('a-sphere').addEventListener('leap-holdstart', function (event) { console.log(event); });
            var aframeHand = selectedHand(this.data.hand, document);
            var hand;
            if(aframeHand)
                hand = aframeHand.components['leap-hand'].getHand();
            //informazioni LeapMotion SDK
            if(validHand(hand))
            {
                //posizione del palmo e riconoscimento gesto
                if(gestureRecognizer(hand))
                {
                    this.el.setAttribute('raycaster', {
                        //lunghezza del raggio
                        far: 5
                    });
                    //hand raycaster
                    var origin = aframeHand.components["leap-hand"].intersector.raycaster.ray.origin;
                    //posizione camera per successivo calcolo posizione relativa (figli della camera)
                    var cameraPosition = this.el.parentNode.getAttribute('position');
                    //posizione relativa per raycaster (figlio della camera)
                    var relativeOriginPosition = (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + (origin.z - cameraPosition.z);
                    //percorso meshline relativo
                    var path = relativeOriginPosition + ', ' + (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + ((origin.z - cameraPosition.z) + pp);
                    //modifica del raycaster del componente con posizione della mano (coincide con la mesh)
                    this.el.setAttribute('raycaster', {
                        showLine: true,
                        origin: relativeOriginPosition
                    });
                    this.el.setAttribute('line', {
                        start: relativeOriginPosition,
                        end: path.split(', ')[1]
                    });
                    if(flag)
                    {
                        this.el.setAttribute('line', {
                            color: '#74BEC1'
                        });
                        this.el.setAttribute('meshline', {
                            lineWidth: 20,
                            path: path,
                            color: '#74BEC1',
                            lineWidthStyler: '1 - p'
                        });
                    }
                    else
                    {
                        this.el.setAttribute('line', {
                            color: '#FFFFFF'
                        });
                        this.el.setAttribute('meshline', {
                            lineWidth: 20,
                            path: path,
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
                    this.el.setAttribute('meshline', {
                        lineWidth: 0,
                        path: '0 0 0, 0 0 0'
                    });
                }
            }
            pp = 0;
            flag = false;
        },

        remove: function () {
            while (this.el.firstChild) {
                this.el.removeChild(this.el.firstChild);
            }
            this.el.parentNode.removeChild(this.el);
        }
    }
);
