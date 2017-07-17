import React, { Component } from 'react';
import styled from 'styled-components';
import injectTapEventPlugin from 'react-tap-event-plugin';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import L from 'leaflet';
import { Map, CircleMarker, Popup, TileLayer, LayerGroup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import './App.css';

const Container = styled.div`
    height: 100%;
    width: 100%;
`;

const FireMap = styled(Map)`
    height: calc(100% - 64px);
    width: 100%;
`

const BASEMAP_URL_MASK = 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGVzZXJhIiwiYSI6IktmZ3lKWlEifQ.zKuHBA0THL8kB3IjA6bEnQ';
const BC_EXTENT = '-139.06,48.30,-114.03,60.00';
const BC_BOUNDS = [[48.30, -139.06],[60.00, -114.03]];
const FIRES_ENDPOINT = 'https://69u0af5a6a.execute-api.us-east-1.amazonaws.com/dev';

injectTapEventPlugin();

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fires: [],
            useClustering: true
        };
    }

    componentWillMount() {
        var http = new XMLHttpRequest();
        http.open('GET', `${FIRES_ENDPOINT}?extent=${BC_EXTENT}`);

        http.addEventListener('load', () => {
            const data = JSON.parse(http.response);
            this.setState({ fires: data.Document.Placemark });
        });

        http.send();
    }

    render() {
        const markers = this.state.fires.map(fire => {
            const coords = fire.Point.coordinates.split(',');
            const colors = {
                '#Fire of Note': 'red',
                '#Active': 'orange',
                '#New': 'grey'
            };
            const status = fire.styleUrl;
            const props = {
                key: fire.name,
                center: L.latLng([coords[1], coords[0]]),
                radius: 5,
                color: colors[status], 
                fill: true,
                fillColor: colors[status],
                fillOpacity: 0.8
            };
            return (
                <CircleMarker {...props}>
                    <Popup>
                        <div dangerouslySetInnerHTML={{ __html: fire.description }}></div>
                    </Popup>
                </CircleMarker>
            );
        });

        const MarkerGroup = this.state.useClustering ? MarkerClusterGroup : LayerGroup;

        return (
            <MuiThemeProvider>
                <Container>
                    <AppBar />
                    <FireMap bounds={BC_BOUNDS} maxZoom={19}>
                        <TileLayer
                            url={BASEMAP_URL_MASK}
                            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
                        <MarkerGroup>{markers}</MarkerGroup>
                    </FireMap>
                </Container>
            </MuiThemeProvider>
        );
    }
}

export default App;
