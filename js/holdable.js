var firstHandPosition = null; //posizione della mano nel momento in cui viene chiamato l'evento leap-holdstart
var start = false; //indica se l'evento sia stato emesso o meno
var target = null; //oggetto da trasformare
var hand = null; //mano che innesca l'evento
var targetOriginalValue = null; //valore iniziale del target per somma posizione
var axis = null; //asse scelto per la modifica
var el = null; //variabile d'appoggio
var i = null; //indice asse
var oldTransformPosition = null;
var control = null;
var handTick = null;
var d = null;

//riprinstina il colore degli assi in hold stop
function oldColor () {
    if (axis === 'x')
        return '#ff0000';
    else if (axis === 'y')
        return '#00ff00';
    else if (axis === 'z')
        return '#0000ff';
    else if (axis === 'all')
        return '#ffffff';
}

//mano che innesca l'evento hold start da cui recuperare la posizione delle dita
function selectHand() {
    let hands = d.querySelectorAll('[leap-hand]');
    for (let j = 0; j < hands.length; j++) {
        if (hands[j].components['leap-hand'].getHand() !== undefined && hands[j].components['leap-hand'].getHand().type === hand.type) {
            if (i !== 3 && control !== 'rotate')
                handTick = hands[j].components['leap-hand'].getHand().pointables[0].tipPosition[i];
            else
                handTick = hands[j].components['leap-hand'].getHand().pointables[0].tipPosition;
        }
    }
}

AFRAME.registerComponent('holdable', {

    init: function () {
        d = document;
        this.el.addEventListener('leap-holdstart', this.onHoldStart.bind(this));
        this.el.addEventListener('leap-holdstop', this.onHoldStop.bind(this));
        el = this.el;
    },

    tick: function () {
        if (start) {
            if (i !== null) {
                //selezione posizione mano in base all'asse
                selectHand();
                if (handTick !== null && handTick !== undefined) {
                    //modifica del parametro in base all'asse scelto, var i
                    //(differenza tra posizione pollice in holdstart e ad ogni tick)
                    switch (i) {
                        case 0:
                            //TODO: piani transform
                            if (control === 'translate') {
                                target.setAttribute('position', (targetOriginalValue.x + (handTick - firstHandPosition[0])) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);
                                //spostamento assi assieme all'oggetto target
                                document.querySelector('#transform').setAttribute('position', (oldTransformPosition.x + ((handTick - firstHandPosition[0])) + ' ' + oldTransformPosition.y + ' ' + oldTransformPosition.z));
                            }
                            else if (control === 'scale') {
                                target.setAttribute('scale', (targetOriginalValue.x + (handTick - firstHandPosition[0])) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);
                            }
                            else if (control === 'rotate') {
                                target.setAttribute('rotation', (targetOriginalValue.x + ((handTick[1] - firstHandPosition[1]) * 360)) + ' ' + targetOriginalValue.y + ' ' + targetOriginalValue.z);
                            }
                            break;
                        case 1:
                            if (control === 'translate') {
                                target.setAttribute('position', targetOriginalValue.x + ' ' + (targetOriginalValue.y + (handTick - firstHandPosition[1])) + ' ' + targetOriginalValue.z);
                                document.querySelector('#transform').setAttribute('position', oldTransformPosition.x + ' ' + (oldTransformPosition.y + (handTick - firstHandPosition[1])) + ' ' + oldTransformPosition.z);
                            } else if (control === 'scale') {
                                target.setAttribute('scale', targetOriginalValue.x + ' ' + (targetOriginalValue.y + (handTick - firstHandPosition[1])) + ' ' + targetOriginalValue.z);
                            } else if (control === 'rotate') {
                                target.setAttribute('rotation', targetOriginalValue.x + ' ' + (targetOriginalValue.y + ((handTick[0] - firstHandPosition[0]) * 360)) + ' ' + targetOriginalValue.z);
                            }
                            break;
                        case 2:
                            if (control === 'translate') {
                                target.setAttribute('position', targetOriginalValue.x + ' ' + targetOriginalValue.y + ' ' + (targetOriginalValue.z + (handTick - firstHandPosition[2])));
                                document.querySelector('#transform').setAttribute('position', oldTransformPosition.x + ' ' + oldTransformPosition.y + ' ' + (oldTransformPosition.z + (handTick - firstHandPosition[2])));
                            } else if (control === 'scale') {
                                target.setAttribute('scale', targetOriginalValue.x + ' ' + targetOriginalValue.y + ' ' + (targetOriginalValue.z + (handTick - firstHandPosition[2])));
                            } else if (control === 'rotate') {
                                target.setAttribute('rotation', targetOriginalValue.x + ' ' + targetOriginalValue.y + ' ' + (targetOriginalValue.z + ((handTick[0] - firstHandPosition[0] + handTick[1] - firstHandPosition[1]) * 180)));
                            }
                            break;
                        case 3:
                            //la distanza viene calcolata solo qui perché all prevede lo stesso valore per tutti gli assi. nei casi diversi da all si tiene conto solo dello spostamento sull'asse scelto
                            let allPosition = document.querySelector('#all').getAttribute('position');
                            let distance = new THREE.Vector3(allPosition.x, allPosition.y, allPosition.z).distanceTo(new THREE.Vector3(handTick[0], handTick[1], handTick[2]));
                            if (control === 'translate') {
                                target.setAttribute('position', (targetOriginalValue.x + distance) + ' ' + (targetOriginalValue.y + distance) + ' ' + (targetOriginalValue.z + distance));
                                document.querySelector('#transform').setAttribute('position', (oldTransformPosition.x + distance) + ' ' + (oldTransformPosition.y + distance) + ' ' + (oldTransformPosition.z + distance));
                            } else if (control === 'scale') {
                                target.setAttribute('scale', (targetOriginalValue.x + distance) + ' ' + (targetOriginalValue.y + distance) + ' ' + (targetOriginalValue.z + distance));
                            } else if (control === 'rotate') {
                                target.setAttribute('rotation', (targetOriginalValue.x + (distance * 360)) + ' ' + (targetOriginalValue.y + (distance * 360)) + ' ' + (targetOriginalValue.z + (distance * 360)));
                            }
                            break;
                    }
                }
                else
                //emette l'evento stop perché la mano non è più visibile
                    el.emit('leap-holdstop');
            }
        }
        else
            targetOriginalValue = i = hand = target = null;
    },

    onHoldStart: function (e) {
        if(control === 'translate')
            oldPosition = null;
        //la vecchia posizione viene sovrascritta da null nel caso di traslazione dell'oggetto
        target = targetObject;
        axis = e.srcElement.id;
        //controllo sull'asse selezionato: tutti, x, y, z
        if (axis === 'all')
            i = 3;
        else if (axis === 'x')
            i = 0;
        else if (axis === 'y')
            i = 1;
        else if (axis === 'z')
            i = 2;
        if (e.detail.hand !== null && e.detail !== undefined && e.detail.hand) {
            //assegnamento mano che innescato l'evento
            hand = e.detail.hand;
            firstHandPosition = e.detail.hand.pointables[0].tipPosition;
            //assegnato target dallo script componente
            start = true;
            document.querySelector('#' + axis).setAttribute('material', {
                color: '#ffff00'
            });
            if(axis !== 'all')
                document.querySelector('#' + axis + 'Line').setAttribute('line', {
                    color: '#ffff00'
                });
            //salvataggio posizione precedente
            if (control === 'translate') {
                targetOriginalValue = target.getAttribute('position');
                oldTransformPosition = document.querySelector('#transform').getAttribute('position');
            }
            else if (control === 'scale')
                targetOriginalValue = target.getAttribute('scale');
            else if (control === 'rotate')
                targetOriginalValue = target.getAttribute('rotation');
        }
    },

    onHoldStop: function () {
        //l'evento emesso è stato "stoppato"
        start = false;
        //assegnamento colore precedente
        document.querySelector('#' + axis).setAttribute('material', {
            color: oldColor()
        });
        if(axis !== 'all')
            document.querySelector('#' + axis + 'Line').setAttribute('line', {
                color: oldColor()
            });
    }
});
