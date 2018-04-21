function selectedHand (hand, document)
{
    var hands = document.querySelectorAll('[leap-hand]');
    if(hands)
    {
        for(var i = 0; i < hands.length; i++)
            if(hands[i].components['leap-hand'] && hands[i].components['leap-hand'].attrValue.hand === hand)
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

function createControl (transform, document, values)
{
    var x, y, z, all;
    var xLine, yLine, zLine;
    //creazione freccia x
    x = document.createElement(values.x.tag);
    x.setAttribute('id', values.x.id);
    x.setAttribute('position', values.x.position);
    x.setAttribute('color', values.x.color);
    x.setAttribute('scale', values.x.scale);
    x.setAttribute('rotation', values.x.rotation);
    x.setAttribute('geometry', values.x.geometry);
    x.setAttribute('holdable', values.x.holdable);
    transform.appendChild(x);
    //creazione linea x
    xLine = document.createElement(values.xLine.tag);
    xLine.setAttribute('line', values.xLine.lineAttribute);
    transform.appendChild(xLine);
    //creazione freccia y
    y = document.createElement(values.y.tag);
    y.setAttribute('id', values.y.id);
    y.setAttribute('position', values.y.position);
    y.setAttribute('color', values.y.color);
    y.setAttribute('scale', values.y.scale);
    y.setAttribute('rotation', values.y.rotation);
    y.setAttribute('geometry', values.y.geometry);
    y.setAttribute('holdable', values.y.holdable);
    transform.appendChild(y);
    //creazione linea y
    yLine = document.createElement(values.yLine.tag);
    yLine.setAttribute('line', values.yLine.lineAttribute);
    transform.appendChild(yLine);
    //creazione freccia z
    z = document.createElement(values.z.tag);
    z.setAttribute('id', values.z.id);
    z.setAttribute('position', values.z.position);
    z.setAttribute('color', values.z.color);
    z.setAttribute('scale', values.z.scale);
    z.setAttribute('rotation', values.z.rotation);
    z.setAttribute('geometry', values.z.geometry);
    z.setAttribute('holdable', values.z.holdable);
    transform.appendChild(z);
    //creazione linea z
    zLine = document.createElement(values.zLine.tag);
    zLine.setAttribute('line', values.zLine.lineAttribute);
    transform.appendChild(zLine);
    //creazione controllo per tutti gli assi
    all = document.createElement(values.all.tag);
    all.setAttribute('id', values.all.id);
    all.setAttribute('position', values.all.position);
    all.setAttribute('color', values.all.color);
    all.setAttribute('scale', values.all.scale);
    all.setAttribute('rotation', values.all.rotation);
    all.setAttribute('material', values.all.material);
    all.setAttribute('geometry', values.all.geometry);
    all.setAttribute('holdable', values.all.holdable);
    transform.appendChild(all);
}

function createTransform (transformType, document)
{
    var values = null;
    var transform = document.createElement('a-entity');
    transform.setAttribute('id','transform');
    document.querySelector('a-scene').appendChild(transform);
    if(transformType === 'translate')
    {
        transform.setAttribute('position', '0 1 -0.5');
        values = {
            x: {
                tag: 'a-cone',
                id: 'x',
                position: '0.1 -0.145 0',
                color: '#ff0000',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 -100',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0.1, -0.145, 0; end: 0 -0.125 0; color: red'
            },
            y: {
                tag: 'a-cone',
                id: 'y',
                position: '0 -0.05 0',
                color: '#00ff00',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 0',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            yLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, -0.05, 0; end: 0 -0.125 0; color: green'
            },
            z: {
                tag: 'a-cone',
                id: 'z',
                position: '-0.1 -0.145 0',
                color: '#0000ff',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 100',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: -0.1, -0.145, 0; end: 0 -0.125 0; color: blue'
            },
            all: {
                tag: 'a-box',
                id: 'all',
                position: '0 -0.125 0',
                color: '#ffffff',
                scale: '0.03 0.03 0.03',
                rotation: '0 45 45',
                material: 'opacity: 0.5',
                geometry: '',
                holdable: ''
            }
        }
    }
    else if(transformType === 'scale')
    {
        transform.setAttribute('position', '0 1 -0.5');
        values = {
            x: {
                tag: 'a-cone',
                id: 'x',
                position: '0.1 -0.145 0',
                color: '#ff0000',
                scale: '0.03 0.03 0.03',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0.1, -0.145, 0; end: 0 -0.125 0; color: red'
            },
            y: {
                tag: 'a-box',
                id: 'y',
                position: '0 -0.05 0',
                color: '#00ff00',
                scale: '0.03 0.03 0.03',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            yLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, -0.05, 0; end: 0 -0.125 0; color: green'
            },
            z: {
                tag: 'a-box',
                id: 'z',
                position: '-0.1 -0.145 0',
                color: '#0000ff',
                scale: '0.03 0.03 0.03',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: -0.1, -0.145, 0; end: 0 -0.125 0; color: blue'
            },
            all: {
                tag: 'a-box',
                id: 'all',
                position: '0 -0.125 0',
                color: '#ffffff',
                scale: '0.03 0.03 0.03',
                rotation: '0 0 0',
                material: 'opacity: 0.5',
                geometry: '',
                holdable: ''
            }
        }
    }
    else if(transformType === 'rotate')
    {
        transform.setAttribute('position', '0 1.5 -0.5');
        transform.setAttribute('scale', '0.75 0.75 0.75');
        values = {
            x: {
                tag: 'a-cylinder',
                id: 'x',
                position: '0 0 0',
                color: '#ff0000',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 0',
                geometry: 'radius: 0.25; height: 10',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0, 0; end: 0 0 0'
            },
            y: {
                tag: 'a-box',
                id: 'y',
                position: '0 0 0',
                color: '#00ff00',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 90',
                geometry: 'radius: 0.25; height: 10',
                holdable: ''
            },
            yLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0, 0; end: 0 0 0'
            },
            z: {
                tag: 'a-torus',
                id: 'z',
                position: '0 0 0',
                color: '#0000ff',
                scale: '0.05 0.05 0.05',
                rotation: '0 0 0',
                geometry: 'radius: 5; radiusTubular: 0.1; segmentsRadial: 100; segmentsTubular: 100',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: -0.1, -0.145, 0; end: 0 -0.125 0; color: blue'
            },
            all: {
                tag: 'a-box',
                id: 'all',
                position: '0 0 0',
                color: '#ffffff',
                scale: '0.03 0.03 0.03',
                rotation: '0 0 0',
                material: 'opacity: 0.5',
                geometry: 'radius: 5; radiusTubular: 0.1; segmentsRadial: 100; segmentsTubular: 100',
                holdable: ''
            }
        }
    }
    createControl(transform, document, values);
}

var self = null;
//true se si è verificato l'evento "intersezione"
var flag = false;
var pp = 0;
var transformCreated = false;
var targetObject = null;
AFRAME.registerComponent('componente', {
        //raycaster (dipendenza dal componente a-frame)
        dependencies: ['raycaster'],
        schema: {
            //mano da utilizzare per il raggio
            hand: {type: 'string', default: 'right', oneOf: ['left', 'right']},
            //controllo da gestire per l'oggetto selezionato
            control: {type: 'string', default: 'translate', oneOf: ['translate', 'scale', 'rotate']},
            selectable: {type: 'string', default: ''}
        },

        init: function () {
            self = this;
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
                targetObject = intersectedObject;
                //mano visibile
                var isVisible = selectedHand(event.srcElement.components['componente'].data.hand, document).components['leap-hand'].isVisible;
                //se l'elemento intersecato non è una mano (e nemmeno il piano)
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
                        if(!transformCreated) {
                            //propagazione evento
                            //creazione transform
                            control = self.data.control;
                            createTransform(self.data.control, document);
                            transformCreated = true;
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

