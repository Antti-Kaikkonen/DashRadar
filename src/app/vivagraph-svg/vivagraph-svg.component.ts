import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, SimpleChanges } from '@angular/core';
import * as Immutable from 'immutable';
import { Address } from '../addresses/address/address';
import { VivagraphSettings } from '../settings/vivagraph-settings';
import { Transaction } from '../transactions/transaction/transaction';
import { VIn } from '../transactions/transaction/vin';
import { VOut } from '../transactions/transaction/vout';


let Viva;

@Component({
  selector: 'app-vivagraph-svg',
  templateUrl: './vivagraph-svg.component.html',
  styleUrls: ['./vivagraph-svg.component.scss']
})
export class VivagraphSvgComponent implements OnInit {

	@Input() transactions: Immutable.Map<string, Transaction>;

  @Input() addresses: Immutable.Map<string, Address>;

  @Input() selectedAddresses: Immutable.Map<string, Address>;

  @Input() selectedTransactions: Immutable.Map<string, Transaction>;

  @Input() vivagraphSettings: VivagraphSettings;

  @Output() onTransactionClicked = new EventEmitter<{transaction: Transaction, mouseEvent: MouseEvent}>();

  @Output() onAddressClicked = new EventEmitter<{address: Address, mouseEvent: MouseEvent}>();

  @Output() onTransactionMouseEnter = new EventEmitter<Transaction>();

  @Output() onAddressMouseEnter = new EventEmitter<Address>();

  @Output() onTransactionMouseLeave = new EventEmitter<Transaction>();

  @Output() onAddressMouseLeave = new EventEmitter<Address>();

  private addressToTransaction: Immutable.Map<string, Immutable.Set<Transaction>>;

  private graph;

  private layout: any;

  private graphics;

  private svgDefs: any;

  private renderer: any;

  isBrowser: boolean;

  constructor(public myElement: ElementRef,
    @Inject(PLATFORM_ID) platformId: string) { 
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      Viva = require('vivagraphjs/dist/vivagraph.min.js');
      this.graph = Viva.Graph.graph();
      this.graphics = Viva.Graph.View.svgGraphics(); 
    }
  	this.addressToTransaction = Immutable.Map<string, Immutable.Set<Transaction>>();  
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    let markerEnd = this.createMarker('TriangleEnd');
    markerEnd.append('path').attr('d', 'M 0 0 L 10 5 L 0 10 z');
    this.graphics.getSvgRoot().attr("shape-rendering", "optimizeSpeed");
    var defs = this.graphics.getSvgRoot().append('defs');
    this.svgDefs = defs;
    defs.append(markerEnd);


    let prefix = "assets/png2/64x64/";
    //let pathPrefix = "assets/png/";
    let prefixDualColor = prefix+"dual_color/";
    let prefixSingleColor = prefix+"single_color/";


    this.graphics.node(this.createNode);

    this.graphics.placeNode(this.placeNode);

    this.graphics.link(this.createLink);

    this.graphics.placeLink(this.placeLink);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.renderer = Viva.Graph.View.renderer(
      this.graph,
      {
        container: this.myElement.nativeElement,
        graphics: this.graphics,
        layout: this.layout,
        renderLinks : true,
        timeStep: 100000,
        prerender : 1000
      }
    );
    this.renderer.run();   
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.isBrowser) return;
    this.graph.beginUpdate();
    if (changes.transactions) {
      let newTx: Immutable.Map<string, Transaction> = changes.transactions.currentValue;
      let oldTx: Immutable.Map<string, Transaction> = changes.transactions.previousValue;
      let addTx: Immutable.Map<string, Transaction> = oldTx === undefined ? newTx: newTx.deleteAll(oldTx.keys());
      let removeTx: Immutable.Map<string, Transaction> = oldTx === undefined ? Immutable.Map<string, Transaction>() : oldTx.deleteAll(newTx.keys());
      removeTx.forEach((tx: Transaction) => this.removeTransaction(tx));
      addTx.forEach((tx: Transaction) => this.addTransaction(tx));
    }

    if (changes.addresses) {
      let newAddr: Immutable.Map<string, Address> = changes.addresses.currentValue;
      let oldAddr: Immutable.Map<string, Address> = changes.addresses.previousValue;
      let addAddr: Immutable.Map<string, Address> = oldAddr === undefined ? newAddr : newAddr.deleteAll(oldAddr.keys());
      let removeAddr: Immutable.Map<string, Address> = oldAddr === undefined ? Immutable.Map<string, Address>() : oldAddr.deleteAll(newAddr.keys());
      removeAddr.forEach((addr: Address) => this.removeAddress(addr));
      addAddr.forEach((addr: Address) => this.addAddress(addr));
    }
    this.graph.endUpdate();

    if (changes.vivagraphSettings || changes.selectedAddresses || changes.selectedTransactions) {
      if (this.renderer !== undefined) {
        this.renderer.resume();
      }
    }

    if (changes.vivagraphSettings) {
      //let minimumSpringLength = this.vivagraphSettings.showValues ? 43 : 0;

      if (!this.layout) {
        this.layout = Viva.Graph.Layout.forceDirected(this.graph, {
          springLength : 100,
          springCoeff : this.vivagraphSettings.springCoeff,
          dragCoeff : this.vivagraphSettings.dragCoeff,
          gravity : this.vivagraphSettings.gravity,
          springTransform: this.customSpringTransform
        });
      }
      //console.log("layout",this.layout);
      this.layout.graph.forEachLink(e => console.log("link", e));
      //console.log("simulator",this.layout.simulator);
      if (this.layout.simulator.springs !== undefined) {
        this.layout.simulator.springs.forEach(spring => {
          let link = this.layout.graph.getLink(spring.from.id, spring.to.id);
          this.customSpringTransform(link, spring);
        });
        if (this.renderer !== undefined) {
          this.renderer.resume();
        }
      }
      let current: VivagraphSettings = changes.vivagraphSettings.currentValue;
      let previous: VivagraphSettings = changes.vivagraphSettings.previousValue;
      //console.log(this.graphics.getSvgRoot());

      if (previous !== undefined && previous.showValues === true && current.showValues === false) {//remove all from dom
        let textElementArray = this.graphics.getSvgRoot().getElementsByTagName('text');
        for (let i = textElementArray.length-1; i >= 0; i--) {
          let element = textElementArray[i];
          console.log(element);
          element.parentElement.removeChild(element);
        }
      } else if (previous !== undefined && previous.showValues === false && current.showValues === true) {//append all to dom
        if (this.layout.simulator.springs !== undefined) {
          this.layout.simulator.springs.forEach(spring => {
            let link = this.layout.graph.getLink(spring.from.id, spring.to.id);
            this.addValueToLink(link);
          });
        }    
      }

      //console.log(current.shapeRendering);
      this.graphics.getSvgRoot().attr("shape-rendering", current.shapeRendering);

      if (current.gravity) {
        this.layout.simulator.gravity(current.gravity);
      }
      if (current.springCoeff) {
        this.layout.simulator.springCoeff(current.springCoeff);
      }
      if (current.dragCoeff) {
        this.layout.simulator.dragCoeff(current.dragCoeff);
      }
    }
  }

  private createMarker(id:string):any {
    return Viva.Graph.svg('marker')
      .attr('id', id)
      .attr('viewBox', "0 0 10 10")
      .attr('refX', "10")
      .attr('refY', "5")
      .attr('markerUnits', "strokeWidth")
      .attr('markerWidth', "10")
      .attr('markerHeight', "5")
      .attr('orient', "auto-start-reverse")
      .attr('fill', 'white');
  };

  private createImagePattern (id: string, url: string): any {
    let pattern = Viva.Graph.svg('pattern')
      .attr('id', id)
      //.attr('patternUnits', "userSpaceOnUse")
      .attr('patternContentUnits', 'objectBoundingBox')
      .attr('width', '100%')
      .attr('height', '100%')
    let image = Viva.Graph.svg('image')
      .attr('x', '0')
      .attr('y', '0')
      .attr('preserveraspectratio', 'none')
      .attr('height', 1)
      .attr('width', 1)
      .attr('href', url);
      //.link(url);
    pattern.append(image);
    return pattern
  }


  private nodeToHref = (node: {
    data?: {
      transaction?: Transaction, address?: Address, 
      mixingTransaction?: boolean, 
      privateSendTransaction?: boolean,
      createDenominationsTransaction?: boolean,
      makeCollateralInputsTransaction?: boolean,
      collateralPaymentTransaction?: boolean
    }
  }): string => {
    let prefix = "assets/png2/64x64/";
    //let pathPrefix = "assets/png/";
    let prefixDualColor: string = prefix + "dual_color/";
    let prefixSingleColor: string = prefix + "single_color/";
    let prefix_selected: string = prefix + "bordered/";


    if (node.data.address) {
      let selected: boolean = this.selectedAddresses !== undefined && this.selectedAddresses.has(node.data.address.addrStr);
      return selected ? prefix_selected+"dash_icon_b.png" : prefixSingleColor + "dash_icon.png";
    } else if (node.data.transaction) {
      let selected: boolean = this.selectedTransactions !== undefined && this.selectedTransactions.has(node.data.transaction.txid);
      if (node.data.transaction.txlock) {
        if (node.data.privateSendTransaction) {
          return selected ? prefix_selected + "private_instant_send_b.png" : prefix + "private_instant_send.png";
        } else {
          return selected ? prefix_selected + "instantx_b.png" : prefixSingleColor + "instantx.png"; 
        }
      } else if (node.data.mixingTransaction) {
        if (node.data.transaction.vin[0].value==0.00100001) {
          return selected ? prefix_selected + "private_send_0-001_b.png" : prefixDualColor + "private_send_0-001.png";
        } else if (node.data.transaction.vin[0].value==0.0100001) {
          return selected ? prefix_selected + "private_send_0-01_b.png" : prefixDualColor + "private_send_0-01.png";
        } else if (node.data.transaction.vin[0].value==0.100001) {
          return selected ? prefix_selected + "private_send_0-1_b.png" : prefixDualColor + "private_send_0-1.png";
        } else if (node.data.transaction.vin[0].value==1.00001) {
          return selected ? prefix_selected + "private_send_1-0_b.png" : prefixDualColor + "private_send_1-0.png";
        } else if (node.data.transaction.vin[0].value==10.0001) {
          return selected ? prefix_selected + "private_send_10-0_b.png" : prefixDualColor + "private_send_10-0.png";
        }
      } else if (node.data.privateSendTransaction) {
        return selected ? prefix_selected + "private_send_b.png" : prefix + "private_send.png";
      } else if (node.data.createDenominationsTransaction) {
        return selected ? prefix_selected + "create_denominations_b.png" : prefix + "create_denominations.png";
      } else if (node.data.transaction.vin.length === 1 && node.data.transaction.vin[0].coinbase) {
        return selected ? prefix_selected + "coinbase_b.png" : prefixSingleColor + "coinbase.png";
      } else if (node.data.collateralPaymentTransaction) {
        return selected ? prefix_selected + "collateral_payment_b.png" : prefixSingleColor + "collateral_payment.png";
      } else if (node.data.makeCollateralInputsTransaction) {
        return selected ? prefix_selected + "make_collateral_inputs_b.png" : prefixSingleColor + "make_collateral_inputs.png";
      } else {
        return selected ? prefix_selected + "tx_b.png" : prefixDualColor+"tx.png";;
      }   
    }

  }


  private createNode = (node: {
      data?: {
        transaction?: Transaction, address?: Address, 
        mixingTransaction?: boolean, 
        privateSendTransaction?: boolean,
        createDenominationsTransaction?: boolean,
        makeCollateralInputsTransaction?: boolean,
        collateralPaymentTransaction?: boolean
      }
    }) => {
    if (node.data.address && node.data.transaction) {
      alert("Error node has address and transaction");
    }
    if (!node.data.address && !node.data.transaction) {
      alert("Error node is not a transaction or address!");
    }



    let image = Viva.Graph.svg("image").attr('x', 0).attr('y', 0).attr('width', 32).attr('height', 32).attr('href', this.nodeToHref(node));

    
    /*let rectangle = Viva.Graph.svg('rect')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 32)
          .attr('height', 32);*/

    image.onmousedown = (mouseEvent) => {
      if (node.data !== undefined && node.data.transaction !== undefined) {
        this.onTransactionClicked.emit({transaction: node.data.transaction, mouseEvent: mouseEvent});
      }
      if (node.data !== undefined && node.data.address !== undefined) {
        this.onAddressClicked.emit({address: node.data.address, mouseEvent: mouseEvent});
      }
    };
    image.onmouseenter = (mouseEvent) => {
      if (node.data !== undefined && node.data.transaction !== undefined) {
        this.onTransactionMouseEnter.emit(node.data.transaction);
      }
      if (node.data !== undefined && node.data.address !== undefined) {
        this.onAddressMouseEnter.emit(node.data.address);
      }
    }; 

    image.onmouseleave = (mouseEvent) => {
      if (node.data !== undefined && node.data.transaction !== undefined) {
        this.onTransactionMouseLeave.emit(node.data.transaction);
      }
      if (node.data !== undefined && node.data.address !== undefined) {
        this.onAddressMouseLeave.emit(node.data.address);
      }
    }   
    return image;
  }

  private addValueToLink = (link) => {
    let text = Viva.Graph.svg('text').attr('font-family', 'arial').attr('font-size', '6').attr('fill', 'white');
    //text.attr('visibility', this.vivagraphSettings.showValues ?  'visible' : 'hidden');
    //text.attr('display', this.vivagraphSettings.showValues ?  'inline' : 'none');

    let textPath = Viva.Graph.svg('textPath').attr('text-anchor', 'middle')
    .attr('startOffset', '50%')
    .attr('href', window.location.href+'#link-'+link.fromId+link.toId);
    let dashAmount = link.data.amount/100000000;
    if (link.data.input && link.data.output) {
      //textPath.attr('startOffset', '50%').attr('text-anchor', 'middle');
      if (link.data.amount > 0) {
        text.attr('fill', 'green');
        textPath.innerHTML = "+"+dashAmount;
      } else if (link.data.amount < 0) {
        text.attr('fill', 'red');
        textPath.innerHTML = dashAmount;
      }
    } else {
      textPath.innerHTML = Math.abs(dashAmount);
    }
    text.append(textPath);
    this.graphics.getSvgRoot().getElementsByTagName("g")[0].append(text);
  }

  private customSpringTransform = (link, spring) => {
    let from = this.graph.getNode(link.fromId);
    let to = this.graph.getNode(link.toId);
    let address = from.data.address || to.data.address;
    let a = address.txApperances;
    let transaction = from.data.transaction || to.data.transaction;
    let b = transaction.vin.length+transaction.vout.length;
    let total = Math.min(200, a+b);
    let minLength = this.vivagraphSettings.showValues ? 50 : 0;//Ensure more space to display dash value
    let r = Math.max(minLength, 15*(total)/(Math.PI*2));
    spring.length = r;
  };


  private placeNode = (nodeUI, pos) => {
    let size: number;
    if (nodeUI.node.data.address) {
      let expanded: boolean = nodeUI.node.links.length === nodeUI.node.data.address.transactions.length;
      if (expanded && this.vivagraphSettings.shrinkExpanded) {
        size = this.vivagraphSettings.iconSize*0.6;
      } else {
        size = this.vivagraphSettings.iconSize;
      }


    } else if (nodeUI.node.data.transaction) {
      let expanded: boolean = nodeUI.node.links.length === nodeUI.node.data.addressCount;
      if (expanded && this.vivagraphSettings.shrinkExpanded) {
        size = this.vivagraphSettings.iconSize*0.6;
      } else {
        size = this.vivagraphSettings.iconSize;
      }

    }

    nodeUI.attr('x', pos.x-size/2);
    nodeUI.attr('y', pos.y-size/2);

    nodeUI.attr('width', size);
    nodeUI.attr('height', size);
    nodeUI.attr('href', this.nodeToHref(nodeUI.node));
  }





  private createLink = (link) => {

    if (this.vivagraphSettings.showValues === true) {
      this.addValueToLink(link);

    }
    
    let result: any = Viva.Graph.svg('path').attr('id', 'link-'+link.fromId+link.toId).attr('stroke-width', '1').attr('marker-end', 'url(#TriangleEnd)');
    if (link.data.output && link.data.input) {
      result.attr('stroke', '#0000ff');
      result.attr('marker-start', 'url(#TriangleEnd)');
    } else if (link.data.output) {
      result.attr('stroke', '#ff0000');
    } else if (link.data.input) {
      result.attr('stroke', '#00ff00');
    }
    return result;
  };

  private placeLink = (linkUI, fromPos, toPos) => {
    let geom = Viva.Graph.geom();
    var from = geom.intersectRect(
      // rectangle:
              fromPos.x - 24 / 2, // left
              fromPos.y - 24 / 2, // top
              fromPos.x + 24 / 2, // right
              fromPos.y + 24 / 2, // bottom
      // segment:
              fromPos.x, fromPos.y, toPos.x, toPos.y)
         || fromPos; // if no intersection found - return center of the node
    var to = geom.intersectRect(
      // rectangle:
              toPos.x - 24 / 2, // left
              toPos.y - 24 / 2, // top
              toPos.x + 24 / 2, // right
              toPos.y + 24 / 2, // bottom
      // segment:
              toPos.x, toPos.y, fromPos.x, fromPos.y)
          || toPos; // if no intersection found - return center of the node


    var data = 'M' + from.x + ',' + from.y +
               'L' + to.x + ',' + to.y;
    linkUI.attr("d", data);
    if (!this.vivagraphSettings.scaleEdgeLines) {
      linkUI.attr('vector-effect',"non-scaling-stroke");
    } else {
      linkUI.attr('vector-effect',"none");
    }
  };

  private addLink(address: Address, transaction: Transaction) {
    let output: boolean = transaction.vout.some((vout: VOut) => vout.scriptPubKey.addresses !== undefined && vout.scriptPubKey.addresses[0] === address.addrStr);
    let input: boolean = transaction.vin.some((vin: VIn) => vin.addr === address.addrStr);

    let amountIn: number = transaction.vout
    .filter((vout: VOut) => vout.scriptPubKey.addresses !== undefined && vout.scriptPubKey.addresses[0] === address.addrStr)
    .map((vout: VOut) => vout.valueSat)
    .reduce((a, b) => isNaN(Number(b)) ? a : a+b, 0);

    let amountOut: number = transaction.vin
    .filter(vin => vin.addr === address.addrStr)
    .map(vin => vin.valueSat)
    .reduce((a, b) => a+b, 0);
    
    let amount = amountIn-amountOut;
    //console.log("adding link ", address,transaction)
    if (input) {
      this.graph.addLink(address.addrStr, transaction.txid, {output: output, input: input, amountIn: amountIn, amountOut: amountOut, amount: amount});
    } else {
      this.graph.addLink(transaction.txid, address.addrStr, {output: output, input: input, amountIn: amountIn, amountOut: amountOut, amount: amount});
    }
  }

  private getTransactionAddresses(transaction: Transaction): Immutable.Set<string> {
    let inputAddr = Immutable.Set(transaction.vin
      .filter(vin => vin.addr !== undefined && vin.addr !== null)
      .map((vin: VIn) => vin.addr));
    let outputAddr = Immutable.Set(transaction.vout
      .filter((vout: VOut) => vout.scriptPubKey.addresses !== undefined)
      .map((vout: VOut) => vout.scriptPubKey.addresses[0]));
    return inputAddr.union(outputAddr);
  }

  private addTransaction(transaction: Transaction) {
    let mixingTransaction: boolean = transaction.isMixingTransaction();
    let privateSendTransaction: boolean = transaction.isPrivateSendTransaction();
    let createDenominationsTransaction: boolean = transaction.isCreateDenominationsTransaction();
    let makeCollateralInputsTransaction: boolean = transaction.isMakeCollateralInputsTransaction();
    let collateralPaymentTransaction: boolean = transaction.isCollateralPaymentTransaction();
    let allAddr = this.getTransactionAddresses(transaction);

    this.addressToTransaction = this.addressToTransaction.withMutations(map => {
      allAddr.forEach(addr => {
        if (map.has(addr)) {
          map.set(addr, map.get(addr).add(transaction))
        } else {
          map.set(addr, Immutable.Set<Transaction>().add(transaction));
        }
      });
    });

    let addressCount = allAddr.size;
    this.graph.addNode(transaction.txid, {
      transaction : transaction, 
      mixingTransaction: mixingTransaction, 
      privateSendTransaction: privateSendTransaction, 
      createDenominationsTransaction: createDenominationsTransaction,
      makeCollateralInputsTransaction: makeCollateralInputsTransaction,
      collateralPaymentTransaction: collateralPaymentTransaction,
      addressCount: addressCount
    });
    this.addresses.filter((address: Address) => 
      address.transactions.includes(transaction.txid)
    ).forEach((address: Address) => 
      this.addLink(address, transaction)
    );
  }

  private removeTransaction(transaction: Transaction) {
    this.graph.removeNode(transaction.txid);
    let allAddr = this.getTransactionAddresses(transaction);
    this.addressToTransaction = this.addressToTransaction.withMutations(map => {
      allAddr.forEach(addr => {
        map.set(addr, map.get(addr).remove(transaction))
      });
    });
  }

  private addAddress(address: Address) {
    this.graph.addNode(address.addrStr, {address : address});
    if (this.addressToTransaction.has(address.addrStr)) {
      this.addressToTransaction.get(address.addrStr).forEach(transaction => this.addLink(address, transaction));
    }
  }

  private removeAddress(address: Address) {
    this.graph.removeNode(address.addrStr);
  }

}