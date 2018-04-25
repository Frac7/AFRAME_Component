var self = null; //this (componente)
//true se si è verificato l'evento "intersezione"
var intersection = false;
var p = 0; //profondità, asse z, oggetto puntato
var transformCreated = false; //flag creazione transform (evita che venga creato più di una volta)
var targetObject = null; //oggetto puntato

//mano selezionata tramite componente
function selectedHand(hand, document) {
    var hands = document.querySelectorAll('[leap-hand]');
    if (hands) {
        for (var i = 0; i < hands.length; i++)
            if (hands[i].components['leap-hand'] && hands[i].components['leap-hand'].attrValue.hand === hand)
                return hands[i];
    }
}

//riconoscimento posa
function gestureRecognizer(hand) {
    //palmo verso l'alto, tre dita estese e due no (pollice, indice, mignolo estese)
    return (hand && hand.palmNormal[1] >= 0 && hand.pointables[0].extended && hand.pointables[1].extended && (!hand.pointables[2].extended) && (!hand.pointables[3].extended) && hand.pointables[4].extended);
}

//mano valida con l'array delle dita popolato
function validHand(hand) {
    return (hand && hand.pointables.length !== 0);
}

//creazione controllo in base ad array di valori
function createControl(transform, document, values) {
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
    all.setAttribute('geometry', values.all.geometry);
    all.setAttribute('holdable', values.all.holdable);
    transform.appendChild(all);
}

//creazione transform (popolamento valori da usare per creare il controllo)
function createTransform(transformType, document) {
    var values = null;
    var transform = document.createElement('a-entity');
    transform.setAttribute('id', 'transform');
    transform.setAttribute('position', targetObject.getAttribute('position'));
    document.querySelector('a-scene').appendChild(transform);
    if (transformType === 'translate') {
        values = {
            x: {
                tag: 'a-cone',
                id: 'x',
                position: '0.2 0 0.2',
                color: '#ff0000',
                scale: '0.1 0.1 0.1',
                rotation: '0 -45 -90',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0.2, 0, 0.2; end: 0 0 0; color: #ff0000'
            },
            y: {
                tag: 'a-cone',
                id: 'y',
                position: '0 0.2 0',
                color: '#00ff00',
                scale: '0.1 0.1 0.1',
                rotation: '0 0 0',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            yLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0.2, 0; end: 0 0 0; color: #00ff00'
            },
            z: {
                tag: 'a-cone',
                id: 'z',
                position: '-0.2 0 0.2',
                color: '#0000ff',
                scale: '0.1 0.1 0.1',
                rotation: '0 45 90',
                geometry: 'radiusBottom: 0.25',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: -0.2, 0, 0.2; end: 0 0 0; color: #0000ff'
            },
            all: {
                tag: 'a-sphere',
                id: 'all',
                position: '0 0 0',
                color: '#ffffff',
                scale: '0.03 0.03 0.03',
                geometry: '',
                holdable: ''
            }
        }
    } else if (transformType === 'scale') {
        values = {
            x: {
                tag: 'a-box',
                id: 'x',
                position: '0.2 0 0.2',
                color: '#ff0000',
                scale: '0.06 0.06 0.06',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0.2, 0, 0.2; end: 0 0 0; color: #ff0000'
            },
            y: {
                tag: 'a-box',
                id: 'y',
                position: '0 0.2 0',
                color: '#00ff00',
                scale: '0.06 0.06 0.06',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            yLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0.2, 0; end: 0 0 0; color: #00ff00'
            },
            z: {
                tag: 'a-box',
                id: 'z',
                position: '-0.2 0 0.2',
                color: '#0000ff',
                scale: '0.06 0.06 0.06',
                rotation: '0 45 0',
                geometry: '',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: -0.2, 0, 0.2; end: 0 0 0; color: #0000ff'
            },
            all: {
                tag: 'a-box',
                id: 'all',
                position: '0 0 0',
                color: '#ffffff',
                scale: '0.05 0.05 0.05',
                geometry: '',
                holdable: ''
            }
        }
    } else if (transformType === 'rotate') {
        values = {
            x: {
                tag: 'a-torus',
                id: 'x',
                position: '0 0 0',
                color: '#ff0000',
                scale: '0.05 0.05 0.05',
                rotation: '0 90 0',
                geometry: 'radius: 5; radiusTubular: 0.05; segmentsRadial: 100; segmentsTubular: 100',
                holdable: ''
            },
            xLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0, 0; end: 0 0 0'
            },
            y: {
                tag: 'a-torus',
                id: 'y',
                position: '0 0 0',
                color: '#00ff00',
                scale: '0.05 0.05 0.05',
                rotation: '90 0 0',
                geometry: 'radius: 5; radiusTubular: 0.05; segmentsRadial: 100; segmentsTubular: 100',
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
                geometry: 'radius: 5; radiusTubular: 0.05; segmentsRadial: 100; segmentsTubular: 100',
                holdable: ''
            },
            zLine: {
                tag: 'a-entity',
                lineAttribute: 'start: 0, 0, 0; end: 0 0 0'
            },
            all: {
                tag: 'a-torus',
                id: 'all',
                position: '0 0 0',
                color: '#ffffff',
                scale: '0.05 0.05 0.05',
                geometry: 'radius: 6; radiusTubular: 0.05; segmentsRadial: 100; segmentsTubular: 100',
                holdable: ''
            }
        }
    }
    createControl(transform, document, values);
}

function createPath (document) {
    /*definizione di diversi event listener: le entità inserite nell'html dinamicamente hanno bisogno
          di essere caricate per poter assegnare degli attributi*/
    //definizione del percorso. il percorso viene creato con un componente esterno per a-frame
    //#1 curva
    var curve = document.createElement('a-curve');
    curve.setAttribute('id', 'curve');
    document.querySelector('a-scene').appendChild(curve);
    //#2 punti (figli)
    var child0 = document.createElement('a-curve-point');
    child0.setAttribute('id', 'point0');
    child0.setAttribute('position', '0 0 0');
    curve.appendChild(child0);
    var child2 = document.createElement('a-curve-point');
    child2.setAttribute('id', 'point2');
    //child2: "origine"
    child2.setAttribute('position', '0 0 0');
    curve.appendChild(child2);
}

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
        this.el.setAttribute('raycaster', {
            //evitare collisioni con la camera o con il raggio stesso
            near: 0.05,
            //lunghezza del raggio
            far: 0.05
        });
        createPath(document);
        //event listener: il raggio ha intersecato qualcosa
        /*nel momento in cui un oggetto viene intersecato dal raggio, viene creato un percorso che parte dalla posizione
        * dell'oggetto e arriva alla posizione della camera (posizione dell'utente) e l'oggetto intersecato segue questo
        * percorso*/
        this.el.addEventListener('raycaster-intersection', this.raycasterIntersection.bind(this));
        this.el.addEventListener('raycaster-intersection-cleared', function () {
            intersection = false;
            p = 0;
        });
    },

    tick: function () {
        var cameraPosition = document.querySelector('[camera]').getAttribute('position');
        var aframeHand = selectedHand(this.data.hand, document);
        var hand;
        if (aframeHand)
            hand = aframeHand.components['leap-hand'].getHand();
        //informazioni LeapMotion SDK
        if (validHand(hand)) {
            //posizione del palmo e riconoscimento gesto
            if (gestureRecognizer(hand)) {
                this.el.setAttribute('raycaster', {
                    //lunghezza del raggio
                    far: 5
                });
                //hand raycaster
                var origin = aframeHand.components["leap-hand"].intersector.raycaster.ray.origin;
                //posizione relativa per raycaster (figlio della camera)
                var relativeOriginPosition = (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + (origin.z - cameraPosition.z);
                //percorso meshline relativo (punto finale con target: il target qui non è ancora definito)
                var path = relativeOriginPosition + ', ' + (origin.x - cameraPosition.x) + ' ' + (origin.y - cameraPosition.y) + ' ' + ((origin.z - cameraPosition.z) + p);
                //modifica del raycaster del componente con posizione della mano (coincide con la mesh)
                this.el.setAttribute('raycaster', {
                    origin: relativeOriginPosition
                });
                if (intersection) {
                    this.el.setAttribute('meshline', {
                        lineWidth: 20,
                        path: path,
                        color: '#74BEC1',
                        lineWidthStyler: '1 - p'
                    });
                }
                else {
                    this.el.setAttribute('meshline', {
                        lineWidth: 20,
                        path: path,
                        color: '#FFFFFF',
                        lineWidthStyler: '1 - p'
                    });
                }
            }
            else {
                this.el.removeAttribute('meshline');
            }
        }
        var transform = document.querySelector('#transform');
        if (transform !== null) {
            //scala il transform in base alla distanza
            var transformPosition = document.querySelector('#transform').getAttribute('position');
            var distance = Math.sqrt(Math.pow(transformPosition.x - cameraPosition.x, 2) + Math.pow(transformPosition.y - cameraPosition.y, 2) + Math.pow(transformPosition.z - cameraPosition.z, 2));
            transform.setAttribute('scale', (distance) + ' ' + (distance) + ' ' + (distance));
        }
    },

    remove: function () {
        while (this.el.firstChild) {
            this.el.removeChild(this.el.firstChild);
        }
        this.el.parentNode.removeChild(this.el);
    },

    raycasterIntersection: function (event) {
        //oggetto intersecato
        var intersectedObject = targetObject = event.detail.els[0];
        //mano visibile
        var isVisible = selectedHand(event.srcElement.components['componente'].data.hand, document).components['leap-hand'].isVisible;
        if (isVisible) {
            //posizioni elemento intersecato e camera per successiva definizione del percorso
            var endPath = intersectedObject.getAttribute('position');
            p = endPath.z;
            var startPath = {
                x: 0,
                y: 1,
                z: - 3
            };
            if (intersectedObject.getAttribute('selectable') !== null) {
                intersection = true;
                document.querySelector('#point0').setAttribute('position', endPath);
                document.querySelector('#point2').setAttribute('position', startPath);
                intersectedObject.setAttribute('alongpath', {
                    curve: '#curve',
                    delay: 1500
                });
                intersectedObject.addEventListener('movingended', function (event) {
                    if (!transformCreated) {
                        //propagazione evento
                        event.srcElement.setAttribute('alongpath', {
                            triggerRadius: 0
                        });
                        event.srcElement.removeAttribute('alongpath');
                        //creazione transform
                        control = self.data.control;
                        createTransform(self.data.control, document);
                        transformCreated = true;
                        event.srcElement.setAttribute('material', 'opacity: 0.5');
                    }
                });
            }
            else
                intersection = false;
        }
    }
});
