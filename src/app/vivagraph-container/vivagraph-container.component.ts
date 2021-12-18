import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import * as Immutable from 'immutable';
import { from, Observable, of, Subject } from 'rxjs';
import { concatMap, delay, distinct, filter, map, mergeMap, take, takeLast, tap, toArray } from 'rxjs/operators';
import * as screenfull from 'screenfull';
import * as io from 'socket.io-client';

import { environment } from '../../environments/environment';
import { AddressService } from '../addresses/address.service';
import { Address } from '../addresses/address/address';
import { BlockService } from '../blocks/block.service';
import { VivagraphSettings } from '../settings/vivagraph-settings';
import { TransactionService } from '../transactions/transaction.service';
import { Transaction } from '../transactions/transaction/transaction';
import { VIn } from '../transactions/transaction/vin';
import { VOut } from '../transactions/transaction/vout';

@Component({
  selector: 'app-vivagraph-container',
  templateUrl: './vivagraph-container.component.html',
  styleUrls: ['./vivagraph-container.component.scss']
})
export class VivagraphContainerComponent implements OnInit, OnDestroy {

  socket: SocketIOClient.Socket;

	transactions: Immutable.Map<string, Transaction> = Immutable.Map<string, Transaction>();
	addresses: Immutable.Map<string, Address> = Immutable.Map<string, Address>();

  selectedTransactions: Immutable.Map<string, Transaction> = Immutable.Map<string, Transaction>();
  selectedAddresses: Immutable.Map<string, Address> = Immutable.Map<string, Address>();

  transactionHower: Transaction;
  addressHower: Address;

  showGuide: boolean = false;

  showAddForm: boolean = false;

  showSettings: boolean = false;

  showTransactionList: boolean = false;

  showAddressList: boolean = false;

  isLive: boolean = false;

  isfullscreen: boolean = false;

  vivagraphSettings: VivagraphSettings = new VivagraphSettings();

  dialogEvent: {transaction?: Transaction, address?: Address, mouseEvent: MouseEvent};

  isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public transactionService: TransactionService,
  	public blockService: BlockService,
  	public addressService: AddressService,
    private sanitizer: DomSanitizer,
    public snackBar: MatSnackBar,
    private changeDetector: ChangeDetectorRef,
    private hostElement: ElementRef,
    private metaService: Meta,
    private titleService: Title,
    @Inject(PLATFORM_ID) platformId: string
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggleFullScreen() {
    screenfull.toggle(this.hostElement.nativeElement);
  }


  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
    this.stopLive();
    this.changeDetector.detach();
  }

  ngOnInit() {

    this.titleService.setTitle("Dash Transaction Graph Visualizer | DashRadar");

    this.metaService.removeTag('name="description"');
    this.metaService.addTag({
      name: "description", 
      content: "Visualize the dash blockchain live or start expanding from an address or a transaction to explore the transaction graph."
    });

    if (this.isBrowser) {
      screenfull.onchange((event)=>{
        this.isfullscreen = screenfull.isFullscreen;
      });
    }

    this.route.queryParams.subscribe((params: Params) => {
      let txStr: string = params['tx'] || params['txs'] || params['transaction'] || params['transactions'];
      if (txStr !== undefined) {
        let txids: Array<string> = txStr.split(":")
        from(txids)
        .pipe(
          filter(txid => txid.length === 64),
          mergeMap((txid: string) => this.transactionService.getTransactionByHash(txid, true)),
          toArray()
        )
        .subscribe((transactions: Array<Transaction>) => {
          this.transactions = this.indexTransactions(transactions);
        });
      }

      let addrStr: string = params['addr'] || params['address'] || params['addrs'] || params['addresses'];
      if (addrStr !== undefined) {
        let addresses: Array<string> = addrStr.split(":")
        from(addresses)
        .pipe(
          delay(5000),
          filter(address => address.length === 34),
          mergeMap((address: string) => this.addressService.getAddress(address)),
          toArray()
        )
        .subscribe((addresses: Array<Address>) => {
          this.addresses = this.indexAddresses(addresses);
        })
      }
    });
  }

  onSettingsChanged(vivaGraphSettings: VivagraphSettings) {
    this.vivagraphSettings = vivaGraphSettings;
  }

  startLive() {
    this.socket = io.connect(environment.insightSocketUrl);
    let audio = null;
    this.socket.on("connect", () => {
      this.socket.emit('subscribe', "inv");
    });
    this.socket.on("block", (data: string) => {
      //console.log("New block received: ", data);
    });
    this.socket.on("txlock", (data: string) => {
      //console.log("txlock", data);
    });
    this.socket.on("tx", (data: any) => {
      //console.log("New transaction received: ", data);
      this.transactionService.getTransactionByHash(data.txid)
      .subscribe((transaction: Transaction) => {

          this.transactions = this.transactions.set(transaction.txid, transaction);
          if (this.vivagraphSettings.liveMaxTransactions > 0 && this.transactions.size > this.vivagraphSettings.liveMaxTransactions) {
            this.transactions = this.transactions.sort((t1: Transaction, t2: Transaction) => t2.time-t1.time).slice(0, this.vivagraphSettings.liveMaxTransactions);
            let remainingInputAddresses = this.transactions.map((tx: Transaction, txid: string) => Immutable.Set(tx.vin)).flatten().map((vin: VIn) => vin.addr).toSet();
            let remainingOutputAddresses = this.transactions.map((tx: Transaction,txid: string) => Immutable.Set(tx.vout)).flatten().map((vout: VOut) => Immutable.Set(vout.scriptPubKey.addresses)).flatten().toSet();
            let remainingAddresses = remainingInputAddresses.union(remainingOutputAddresses);
            this.addresses = this.addresses.filter((address: Address, addrStr: string) => remainingAddresses.has(addrStr));
          }
          this.expandTransaction(transaction);
          if (audio === null) {
            audio = new Audio('assets/audio/Coin_Drop-Willem_Hunt-single_drop.mp3');  
          }
          if (this.vivagraphSettings.soundEnabled) {
            audio.play();
          }
      });
    });
  }

  stopLive() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.close()
    }
  }

  toggleLive() {
    if (!this.isLive) {
      this.startLive();
    } else {
      this.stopLive();
    }
    this.isLive = !this.isLive;
    let message: string = this.isLive ? "Started listening for new transactions" : "Stopped listening for new transactions";
    this.snackBar.open(message, undefined, {
      duration: 2000,
    });
  }

  expandAddress(address: Address) {
    if (address.txApperances > this.vivagraphSettings.maxNodeEdges) {
      alert("This address has "+address.txApperances+" transactions. Max limit is "+this.vivagraphSettings.maxNodeEdges);
      return;
    }
    from(address.transactions)
    .pipe(
      mergeMap(
        (txId: string) => this.transactionService.getTransactionByHash(txId, true)
      ),
      toArray()
    )
    .subscribe((transactions: Array<Transaction>) => 
      this.transactions = this.transactions.merge(this.indexTransactions(transactions)));
  }

  deleteAddress(address: Address) {
    this.addresses = this.addresses.delete(address.addrStr);
    this.selectedAddresses = this.selectedAddresses.remove(address.addrStr);
  }

  deleteTransaction(transaction: Transaction) {
    this.transactions = this.transactions.remove(transaction.txid);
    this.selectedTransactions = this.selectedTransactions.remove(transaction.txid);
  }

  onAddressClicked(event: {address: Address, mouseEvent: MouseEvent}) {
    if (event.mouseEvent.button === 2) {
      this.dialogEvent = event;
    } else if (event.mouseEvent.ctrlKey === true) {
      this.expandAddress(event.address);
    } else if (event.mouseEvent.shiftKey === true) {
      this.deleteAddress(event.address);
    } else if (event.mouseEvent.detail == 2) {
      this.expandAddress(event.address);
    }
  }

  expandTransactionInputs(transaction: Transaction) {
    if (transaction.vin.length > this.vivagraphSettings.maxNodeEdges) {
      alert("Transactions has "+transaction.vin.length+" inputs. Max limit is "+this.vivagraphSettings.maxNodeEdges+".");
      return;
    }
    from(transaction.vin)
    .pipe(
      filter((vin: VIn) => vin.addr !== undefined && vin.addr !== null),
      distinct((vin: VIn) => vin.addr),
      mergeMap( 
        (input: VIn) => 
        this.addressService.getAddress(input.addr)
      ),
      toArray()
    )
    .subscribe((addresses: Array<Address>) => {
      //First remove then add
      let newAddresses: Array<Address> = addresses.filter((address: Address) => !this.addresses.has(address.addrStr));
      let updatedAddresses: Array<Address> = addresses.filter((newAddress: Address) => {
        let oldAddress: Address = this.addresses.get(newAddress.addrStr);
        return oldAddress != undefined && !this.addressEquals(newAddress, oldAddress);
      });
      this.addresses = this.addresses.deleteAll(updatedAddresses.map(address => address.addrStr));
      this.changeDetector.detectChanges();
      this.addresses = this.addresses.merge(this.indexAddresses(updatedAddresses), this.indexAddresses(newAddresses));
    });
  }

  expandTransactionOutputs(transaction: Transaction) {
    if (transaction.vout.length > this.vivagraphSettings.maxNodeEdges) {
      alert("Transactions has "+transaction.vout.length+" outputs. Max limit is "+this.vivagraphSettings.maxNodeEdges+".");
      return;
    }
    from(transaction.vout)
    .pipe(
      filter((vout: VOut) => vout.scriptPubKey.addresses !== undefined),
      distinct((vout: VOut) => vout.scriptPubKey.addresses),
      mergeMap( 
        (output: VOut) => 
        this.addressService.getAddress(output.scriptPubKey.addresses[0])
      ),
      toArray()
    )
    .subscribe((addresses: Array<Address>) => {
      let newAddresses: Array<Address> = addresses.filter((address: Address) => !this.addresses.has(address.addrStr));
      let updatedAddresses: Array<Address> = addresses.filter((newAddress: Address) => {
        let oldAddress: Address = this.addresses.get(newAddress.addrStr);
        return oldAddress != undefined && !this.addressEquals(newAddress, oldAddress);
      });
      this.addresses = this.addresses.deleteAll(updatedAddresses.map(address => address.addrStr));
      this.changeDetector.detectChanges();
      this.addresses = this.addresses.merge(this.indexAddresses(updatedAddresses), this.indexAddresses(newAddresses));
    });
  }

  expandTransaction(transaction: Transaction) {
    if (transaction.vin.length+transaction.vout.length > this.vivagraphSettings.maxNodeEdges) {
      alert("Transactions has "+transaction.vin.length+" inputs and "+transaction.vout.length+" output. Max limit is "+this.vivagraphSettings.maxNodeEdges+" inputs and outputs combined.");
      return;
    }
    this.expandTransactionInputs(transaction);
    this.expandTransactionOutputs(transaction);
  }

  onTxClicked(event: {transaction: Transaction, mouseEvent: MouseEvent}) {
    if (event.mouseEvent.button === 2) {
      this.dialogEvent = event;
    } else if (event.mouseEvent.ctrlKey === true) {
      this.expandTransaction(event.transaction);
    } else if (event.mouseEvent.shiftKey === true) {
      this.deleteTransaction(event.transaction);
    } else if (event.mouseEvent.detail == 2) {
      this.expandTransaction(event.transaction);
    }
  }

  onTransactionMouseEnter(transaction: Transaction) {
    this.transactionHower = transaction;
  }

  onTransactionMouseLeave(transaction: Transaction) {
    if (this.transactionHower !== undefined && this.transactionHower !== null) {
      if (this.transactionHower === transaction) {
        this.transactionHower = undefined;
      }
    }
  }

  onAddressMouseEnter(address: Address) {
    this.addressHower = address;
  }
  
  onAddressMouseLeave(address: Address) {
    if (this.addressHower !== undefined && this.addressHower !== null) {
      if (this.addressHower === address) {
        this.addressHower = undefined;
      }
    }
  }

  //ADDRS

  toggleSelectAddress(address: Address) {
    if (this.selectedAddresses.has(address.addrStr)) {
      this.selectedAddresses = this.selectedAddresses.delete(address.addrStr);
    } else {
      this.selectedAddresses = this.selectedAddresses.set(address.addrStr, address);
    }
  }

  toggleSelectAllAddresses() {
    if (!this.allAddressesSelected()) {
      this.selectedAddresses = this.selectedAddresses.merge(this.addresses);
    } else {
      this.selectedAddresses = this.selectedAddresses.clear();
    }
  }

  deleteSelectedAddresses() {
    this.selectedAddresses.forEach((address: Address) => this.deleteAddress(address));
  }

  expandSelectedAddresses() {
    this.selectedAddresses.forEach((address: Address) => this.expandAddress(address));
  }

  //TXS

  toggleSelectTransaction(transaction: Transaction) {
    if (this.selectedTransactions.has(transaction.txid)) {
      this.selectedTransactions = this.selectedTransactions.delete(transaction.txid);
    } else {
      this.selectedTransactions = this.selectedTransactions.set(transaction.txid, transaction);
    }
  }

  toggleSelectAllTransactions() {
    if (!this.allTransactionsSelected()) {
      this.selectedTransactions = this.selectedTransactions.merge(this.transactions);
    } else {
      this.selectedTransactions = this.selectedTransactions.clear();
    }
  }

  deleteSelectedTransactions() {
    this.selectedTransactions.forEach((transaction: Transaction) => this.deleteTransaction(transaction));
  }

  expandSelectedTransactions() {
    this.selectedTransactions.forEach((transaction: Transaction) => this.expandTransaction(transaction));
  }

  expandSelectedTransactionsInputs() {
    this.selectedTransactions.forEach((transaction: Transaction) => this.expandTransactionInputs(transaction));
  }

  expandSelectedTransactionsOutputs() {
    this.selectedTransactions.forEach((transaction: Transaction) => this.expandTransactionOutputs(transaction));
  }

  toggleSettings() {
    this.showGuide = false;
    this.showAddForm = false;
    this.showSettings = !this.showSettings;
    this.showTransactionList = false;
    this.showAddressList = false;
  }

  toggleGuide() {
    this.showSettings = false;
    this.showAddForm = false;
    this.showGuide = !this.showGuide;
    this.showTransactionList = false;
    this.showAddressList = false;
  }

  toggleAddForm() {
    this.showGuide = false;
    this.showSettings = false;
    this.showAddForm = !this.showAddForm;
    this.showTransactionList = false;
    this.showAddressList = false;
  }

  toggleTransactionList() {
    this.showTransactionList = !this.showTransactionList;
    this.showGuide = false;
    this.showSettings = false;
    this.showAddForm = false;
    this.changeDetector.detectChanges();
    this.showAddressList = false;
  }

  toggleAddressList() {
    this.showAddressList = !this.showAddressList;
    this.showGuide = false;
    this.showSettings = false;
    this.showAddForm = false;
    this.changeDetector.detectChanges();
    this.showTransactionList = false;
  }

  toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  downloadSvg() {

    let oringinalSvg = document.getElementsByTagName("svg")[0];
    let cloneSvg = <SVGSVGElement> oringinalSvg.cloneNode(true);
    let bbox = oringinalSvg.getElementsByTagName("g")[0].getBBox();
    cloneSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    let g = cloneSvg.getElementsByTagName("g")[0];

    let textPaths = cloneSvg.getElementsByTagName('textPath');
    for (let i = 0; i < textPaths.length; i++) {
      let oldHref = textPaths[i].getAttribute("href");
      let newHref = oldHref.substr(oldHref.indexOf("#"));
      textPaths[i].setAttribute("href", newHref);
    }

    let images = cloneSvg.getElementsByTagName("image");

    var eventStream = new Subject();
    for (let i = 0; i < images.length; i++) {
      let src = images[i].getAttribute("href");

      let cb = (result: string) => {
        images[i].setAttribute("xlink:href", result);
        images[i].removeAttribute("href");
        eventStream.next();
      }

      this.toDataURL(src, cb); 
    }

    eventStream
    .pipe(
      take(images.length),
      takeLast(1)
    ).subscribe(e => {
      cloneSvg.setAttribute("width", ""+bbox.width);
      cloneSvg.setAttribute("height", ""+bbox.height);
      cloneSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      let rect = document.createElementNS("http://www.w3.org/2000/svg","rect");
      rect.setAttribute("fill", "black");
      rect.setAttribute("stroke-width", "0")
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", ""+bbox.width);
      rect.setAttribute("height", ""+bbox.height);
      cloneSvg.insertBefore(rect, cloneSvg.firstChild);
      g.setAttribute("transform", "matrix(1, 0, 0, 1, "+-bbox.x+", "+-bbox.y+")");
      g.setAttribute("buffered-rendering", "static");
      var re = new RegExp("href=\"", 'g');
      let svgData = cloneSvg.outerHTML;
      var preface = '<?xml version="1.0" standalone="no"?>\r\n';
      var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
      var svgUrl = URL.createObjectURL(svgBlob);
      var downloadLink = document.createElement("a");

      downloadLink.href = svgUrl;
      downloadLink.download = "dashradar_open_me_with_browser.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  private allAddressesSelected(): boolean {
    return !this.selectedAddresses.isEmpty() && this.selectedAddresses.size === this.addresses.size
  }

  private allTransactionsSelected(): boolean {
    return !this.selectedTransactions.isEmpty() && this.selectedTransactions.size === this.transactions.size
  }

  //Returns true if create denominations transaction was found at the edges
  private expandInputs(transaction: Transaction, rounds: number, maxRounds: number, dividend: number, divisor: number): Observable<boolean> {
    if (rounds > maxRounds) return of(false);
    if (transaction.isCreateDenominationsTransaction()) {
      //this.expandTransactionInputs(transaction);
      if (rounds === maxRounds) return of(true);
    }
    if (rounds > 0 && !transaction.isMixingTransaction()) return of(false);
    return from(transaction.vin)
    .pipe(
      filter((vin: VIn) => vin.addr !== undefined && vin.addr !== null),
      distinct((vin: VIn) => vin.addr),
      mergeMap(
        (vin: VIn) => this.transactionService.getTransactionByHash(vin.txid, true)
        .pipe(
          map((tx: Transaction) => {
            let result: {input: VIn, transaction: Transaction} = {input: vin, transaction: tx};
            return result;
          })
        ),
        6
      ),
      mergeMap(
        (v: {input: VIn, transaction: Transaction}) => 
        this.expandInputs(v.transaction, rounds+1, maxRounds, 1, 1)
        .pipe(map((valueFromPromise: boolean) => {
          let result: {vin: VIn, transaction: Transaction, result: boolean} = {vin: v.input, transaction: v.transaction, result: valueFromPromise};
          return result;
        })),
        2
      ),
      tap(
        (v: {vin: VIn, transaction: Transaction, result: boolean}) => {
          if (v.result === true) {
            this.transactions = this.transactions.set(v.transaction.txid, v.transaction);
            this.addressService.getAddress(v.vin.addr, true)
            .subscribe((address: Address) => {
              this.addresses = this.addresses.set(address.addrStr, address)
            })
          }
        }
      ),
      concatMap((v: {vin: VIn, result: boolean}) => of(v.result))
    );
  }

  private indexTransactions(transactions: Array<Transaction>): Immutable.Map<string, Transaction> {
    return transactions.reduce((accumulator: Immutable.Map<string, Transaction>, currentValue: Transaction) => accumulator.set(currentValue.txid, currentValue), 
      Immutable.Map<string, Transaction>()
    );
  }

  private indexAddresses(addreses: Array<Address>): Immutable.Map<string, Address> {
    return addreses.reduce((accumulator: Immutable.Map<string, Address>, currentValue: Address) => accumulator.set(currentValue.addrStr, currentValue), 
      Immutable.Map<string, Address>()
    );
  }

  private addressEquals(address1: Address, address2: Address): boolean {
    return address1.balance === address2.balance && 
      address1.totalReceived === address2.totalReceived && 
      address1.totalSent === address2.totalSent &&
      address1.txApperances === address2.txApperances &&
      address1.transactions.length === address2.transactions.length &&
      Immutable.Set(address1.transactions).equals(Immutable.Set(address2.transactions));
  }

  private isDenomination(value: number): boolean {
    return (value == 0.0100001 || value == 0.100001 || value == 1.00001 || value == 10.0001); 
  }

}
