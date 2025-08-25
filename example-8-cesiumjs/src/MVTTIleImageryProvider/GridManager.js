import {
  Viewer,
  Color,
  Cartesian3,
  Cartographic,
  Math as CesiumMath,
  Primitive,
  GeometryInstance,
  PolylineGeometry,
  PolylineMaterialAppearance,
  ColorGeometryInstanceAttribute,
  Material
} from "cesium";

class GridManager {
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.ellipsoid = this.scene.globe.ellipsoid;

    this.options = Object.assign({
      minCellDegrees: 0.0005,
      updateDistanceThreshold: 0.15,
      lineColor: Color.YELLOW.withAlpha(0.6),
      lineWidth: 2.0
    }, options);

    this._tileCache = new Map(); // key = "lon_lat_cellDeg", value = GeometryInstance
    this._primitive = new Primitive({
      geometryInstances: [],
      appearance: new PolylineMaterialAppearance({
        material: Material.fromType("Color", { color: this.options.lineColor }),
      }),
      asynchronous: false
    });
    this.scene.primitives.add(this._primitive);

    this._lastViewRect = null;
    this._lastCellDegrees = null;
    this._needsUpdate = true;
    this._throttleTimeout = null;

    this._registerHandlers();
  }

  _registerHandlers() {
    const schedule = () => {
      if (this._throttleTimeout) return;
      this._throttleTimeout = setTimeout(() => {
        this._throttleTimeout = null;
        this._maybeUpdateGrid();
      }, 120);
    };

    this.viewer.camera.changed.addEventListener(schedule);
    this.viewer.camera.moveEnd.addEventListener(() => this._maybeUpdateGrid(true));
    this.scene.preRender.addEventListener(() => this._maybeUpdateGrid());
  }

  _computeViewRectangle() {
    try {
      return this.viewer.camera.computeViewRectangle(this.ellipsoid);
    } catch {
      return undefined;
    }
  }

  _cameraHeight() {
    const pos = this.viewer.camera.positionCartographic;
    return pos ? pos.height : 0;
  }

  _calcCellDegreesFromHeight(height) {
    if (height < 200) return 0.001;
    if (height < 1000) return 0.01;
    if (height < 5000) return 0.05;
    if (height < 20000) return 0.25;
    if (height < 100000) return 1.0;
    return 5.0;
  }

  _viewRectChangedEnough(oldRect, newRect) {
    if (!oldRect || !newRect) return true;
    const dx = Math.abs(((newRect.west + newRect.east) / 2) -
                        ((oldRect.west + oldRect.east) / 2));
    const dy = Math.abs(((newRect.south + newRect.north) / 2) -
                        ((oldRect.south + oldRect.north) / 2));
    const widthOld = Math.abs(oldRect.east - oldRect.west);
    const heightOld = Math.abs(oldRect.north - oldRect.south);
    const frac = this.options.updateDistanceThreshold;
    if (dx > widthOld * frac || dy > heightOld * frac) return true;

    const widthNew = Math.abs(newRect.east - newRect.west);
    const heightNew = Math.abs(newRect.north - newRect.south);
    if (Math.abs(widthNew - widthOld) / Math.max(widthOld, 1e-9) > 0.15) return true;
    if (Math.abs(heightNew - heightOld) / Math.max(heightOld, 1e-9) > 0.15) return true;
    return false;
  }

  _maybeUpdateGrid(force = false) {
    const rect = this._computeViewRectangle();
    if (!rect) return;
    const camHeight = this._cameraHeight();
    let cellDeg = Math.max(this._calcCellDegreesFromHeight(camHeight), this.options.minCellDegrees);

    if (!force) {
      if (!this._viewRectChangedEnough(this._lastViewRect, rect) &&
          this._lastCellDegrees === cellDeg && !this._needsUpdate) {
        return;
      }
    }

    this._lastViewRect = rect;
    this._lastCellDegrees = cellDeg;
    this._needsUpdate = false;
    this._updateGridForRect(rect, cellDeg);
  }

  _updateGridForRect(rect, cellDeg) {
    const westDeg = CesiumMath.toDegrees(rect.west);
    const southDeg = CesiumMath.toDegrees(rect.south);
    const eastDeg = CesiumMath.toDegrees(rect.east);
    const northDeg = CesiumMath.toDegrees(rect.north);

    const pad = cellDeg * 2;
    let west = westDeg - pad;
    let south = southDeg - pad;
    let east = eastDeg + pad;
    let north = northDeg + pad;

    south = Math.max(south, -89.999);
    north = Math.min(north, 89.999);

    const neededKeys = new Set();

    for (let lon = Math.floor(west / cellDeg) * cellDeg; lon < east; lon += cellDeg) {
      for (let lat = Math.floor(south / cellDeg) * cellDeg; lat < north; lat += cellDeg) {
        const key = `${lon.toFixed(6)}_${lat.toFixed(6)}_${cellDeg}`;
        neededKeys.add(key);
        if (!this._tileCache.has(key)) {
          const instance = this._makeCellLines(lon, lat, cellDeg);
          if (instance) {
            this._tileCache.set(key, instance);
            this._primitive.geometryInstances.push(instance);
          }
        }
      }
    }

    // Remove unused tiles from primitive & cache
    for (const key of [...this._tileCache.keys()]) {
      if (!neededKeys.has(key)) {
        this._tileCache.delete(key);
        // Full rebuild of primitive geometryInstances
        this._primitive.geometryInstances = [...this._tileCache.values()];
      }
    }
  }

  _makeCellLines(lon, lat, cellDeg) {
    // Lines at altitude 0 (sea level)
    const lon1 = lon + cellDeg;
    const lat1 = lat + cellDeg;
    const height = 0;

    const corners = [
      Cartesian3.fromDegrees(lon,  lat, height),
      Cartesian3.fromDegrees(lon1, lat, height),
      Cartesian3.fromDegrees(lon1, lat1, height),
      Cartesian3.fromDegrees(lon,  lat1, height),
      Cartesian3.fromDegrees(lon,  lat, height) // close loop
    ];

    const geom = PolylineGeometry.createGeometry(new PolylineGeometry({
      positions: corners,
      width: this.options.lineWidth,
      vertexFormat: PolylineMaterialAppearance.VERTEX_FORMAT
    }));

    if (!geom) return null;

    return new GeometryInstance({
      geometry: geom,
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(this.options.lineColor)
      }
    });
  }
}


export default GridManager;