import { DOCUMENT, formatPercent, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTabChangeEvent, MatTableDataSource } from '@angular/material';
import { Meta, Title } from '@angular/platform-browser';
import * as d3 from 'd3/d3.min.js';
import * as countries from 'i18n-iso-countries';
import * as Papa from 'papaparse';

const english_countries = require('i18n-iso-countries/langs/en.json');

countries.registerLocale(english_countries);
let Datamap: any;

@Component({
  selector: 'app-nodes-dashboard',
  templateUrl: './nodes-dashboard.component.html',
  styleUrls: ['./nodes-dashboard.component.scss']
})
export class NodesDashboardComponent implements OnInit {

  displayedColumns: string[] = ['key', 'nodes', 'masternodes'];

  nodeColumns: string[] = ["host", "port", "uptime2h", "subversion", "masternode"];

  availableNodeColumns: Column[] = [{label:"ip", property:"host"}, {label:"port", property:"port"}, {label:"uptime2h", property:"uptime2h"}, {label:"uptime8h", property:"uptime8h"}, 
  {label:"uptime24h", property:"uptime24h"}, {label:"uptime7d", property:"uptime7d"}, {label:"uptime30d", property:"uptime30d"}, {label:"country", property:"country"}, {label:"city", property:"city"},
  {label:"organization", property:"organization"}, {label:"version", property:"subversion"}, {label:"masternode", property:"masternode"}];

  organizations = [];  
  countries = [];
  versions = [];
  country2count = {};
  datamap;
  mnoptions = ["All nodes", "Masternodes", "Non masternodes"];
  ismn = this.mnoptions[0];

  paginator: MatPaginator;
  sort: MatSort;
  dashnodes: DashNode[] = [];
  nodes = new MatTableDataSource<DashNode>([]);
    
  isBrowser: boolean;

  constructor(private http: HttpClient,
        private titleService: Title,
        private metaService: Meta,
        @Inject(PLATFORM_ID) platformId: string,
        @Inject(DOCUMENT) private document: Document) { 
        this.isBrowser = isPlatformBrowser(platformId);
        if (this.isBrowser) {
            Datamap = require('datamaps/dist/datamaps.world.js');
        }
  }

  applyMnFilter(event) {
    this.ismn = event;
    this.applyFilter(this.nodes.filter);
  }

  column2String(dashnode: DashNode, column: string) {
    if (column.startsWith("uptime")) {
        return formatPercent(dashnode[column], "en-US");
    } else {
        return String(dashnode[column]).toLowerCase();
    }
  }

  applyFilter(filterValue: string) {
    this.nodes.filterPredicate = (dashnode, filter) => {
        if (this.ismn === "Masternodes" && dashnode.masternode === false) return false;
        if (this.ismn === "Non masternodes" && dashnode.masternode === true) return false;
        if (filter === "$empty$") return true;
        return this.nodeColumns.some(column => this.column2String(dashnode, column).indexOf(filter) > -1);
    };    
    let filter = filterValue;
    if (filter === "") filter = "$empty$";
    this.nodes.filter = filter.trim().toLowerCase();
  }

  renderMap() {
    if (!this.isBrowser) return;
    if (this.datamap !== undefined) return;
    let container = this.document.getElementById('mapContainer');
    if (container === null || container === undefined) return;
    this.datamap = new Datamap({
        element: container,
        projection: 'mercator', // big world map
        responsive: false,
        // countries don't listed in dataset will be painted with this color
        fills: { defaultFill: '#F5F5F5' },
        data: this.country2count,
        geographyConfig: {
            borderColor: '#DEDEDE',
            highlightBorderWidth: 2,
            // don't change color on mouse hover
            highlightFillColor: function(geo) {
                return geo['fillColor'] || '#F5F5F5';
            },
            // only change border
            highlightBorderColor: '#B7B7B7',
            // show desired information in tooltip
            popupTemplate: function(geo, data) {
                // don't show tooltip if country don't present in dataset
                if (!data) { return ; }
                // tooltip content
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Nodes: <strong>', data.numberOfNodes, '</strong>',
                    '<br>Masternodes: <strong>', data.numberOfMasternodes, '</strong>',
                    '</div>'].join('');
            }
        }
    });
  }

  tabChanged(event: MatTabChangeEvent) {
      if (event.tab.textLabel === "Map") {
        this.renderMap();
      }
  }

  ngOnInit() {
    this.titleService.setTitle("Dash Nodes | DashRadar");
    this.metaService.removeTag('name="description"');
    this.metaService.addTag({
        name: "description", 
        content: "Dash full nodes and masternodes. Map - Versions - Countries - Organizations - All nodes"
    });

    this.applyFilter("");
    this.nodes.paginator = this.paginator;
    this.nodes.sort = this.sort;
    this.http.get("https://nodes.dashradar.com/dash.csv", {responseType: 'text'}).subscribe(e => {
        let parsed = Papa.parse(e);
        this.dashnodes = parsed.data.map(row => {
            let res: DashNode = {
                host: row[0],
                port: Number(row[1]),
                uptime2h: Number(row[2].slice(0, -1))/100,
                uptime8h: Number(row[3].slice(0, -1))/100,
                uptime24h: Number(row[4].slice(0, -1))/100,
                uptime7d: Number(row[5].slice(0, -1))/100,
                uptime30d: Number(row[6].slice(0, -1))/100,
                country: row[8],
                city: row[9],
                latitude: Number(row[10]),
                longitude: Number(row[11]),
                organization: row[12],
                bestHeight: Number(row[13]),
                version: Number(row[14]),
                subversion: row[15],
                masternode: row[16] === "1"
            };
            return res;
        });
        this.nodes.data = this.dashnodes;

        let activeNodes = this.dashnodes.filter(node => node.uptime2h === 1);
        activeNodes.forEach(node => {
            let countryCode = countries.getAlpha3Code(node.country, 'en');
            if (countryCode === undefined) return;
            if (this.country2count[countryCode] === undefined) {
                this.country2count[countryCode] = {numberOfNodes: 0,
                numberOfMasternodes: 0};
            }
            this.country2count[countryCode].numberOfNodes++;
            if (node.masternode) this.country2count[countryCode].numberOfMasternodes++;
        });

        let countryArr = Object.keys(this.country2count)
        .map(country => [
            countries.getName(country, "en"), this.country2count[country].numberOfNodes, 
            this.country2count[country].numberOfMasternodes, countries.alpha3ToAlpha2(country).toLowerCase()
        ]);
        countryArr.sort((a, b) => b[1]-a[1]);
        this.countries = countryArr;
        let organization2count = {};
        activeNodes.forEach(node => {
            let organization = node.organization;
            if (organization2count[organization] === undefined) {
                organization2count[organization] = {numberOfNodes: 0, numberOfMasternodes: 0};
            } 
            organization2count[organization].numberOfNodes++;
            if (node.masternode) organization2count[organization].numberOfMasternodes++;
        });
        let organizationsArr = Object.keys(organization2count).map(organization => [organization, organization2count[organization].numberOfNodes, organization2count[organization].numberOfMasternodes]);
        organizationsArr.sort((a, b) => b[1]-a[1]);
        this.organizations = organizationsArr;

        let ua2count = {};
        activeNodes.forEach(node => {
            let ua = node.subversion;
            if (ua2count[ua] === undefined) {
                ua2count[ua] = {numberOfNodes: 0, numberOfMasternodes: 0};
            } 
            ua2count[ua].numberOfNodes++;
            if (node.masternode) ua2count[ua].numberOfMasternodes++;
        });
        let uaArr = Object.keys(ua2count).map(ua => [ua, ua2count[ua].numberOfNodes, ua2count[ua].numberOfMasternodes]);
        uaArr.sort((a, b) => b[1]-a[1]);
        this.versions = uaArr;

        let onlyValues = Object.keys(this.country2count).map(iso => this.country2count[iso].numberOfNodes);
        var minValue = Math.min.apply(null, onlyValues),
        maxValue = Math.max.apply(null, onlyValues);
        let paletteScale = d3.scale.linear()
            .domain([minValue,maxValue])
            .range(["#EFEFFF","#02386F"]);

        Object.keys(this.country2count).forEach(iso => {
            this.country2count[iso].fillColor = paletteScale(this.country2count[iso].numberOfNodes);
        });
        this.renderMap();
    });

  }

  ngOnDestroy() {
    this.metaService.removeTag('name="description"');
  }

}

interface Column {
  label: string,
  property: string
}


interface DashNode {
  host: string;
  port: number;
  uptime2h: number;
  uptime8h: number;
  uptime24h: number;
  uptime7d: number;
  uptime30d: number;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  organization: string;
  bestHeight: number;
  version: number;
  subversion: string;
  masternode: boolean;
}