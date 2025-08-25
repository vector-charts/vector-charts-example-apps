import {
  Cartesian3,
  BoundingSphere,
  BoxGeometry,
  Cartographic,
  Color,
  ColorGeometryInstanceAttribute,
  destroyObject,
  Event,
  GeographicTilingScheme,
  GeometryInstance,
  PerInstanceColorAppearance,
  Primitive,
  QuadtreePrimitive,
  QuadtreeTileLoadState,
  QuadtreeTileProvider
} from "cesium";

class BoxTileProvider {
  constructor() {
    this._quadtree = undefined;
    this._tilingScheme = new GeographicTilingScheme();
    this._errorEvent = new Event();
    this._levelZeroMaximumError =
      QuadtreeTileProvider.computeDefaultLevelZeroMaximumGeometricError(
        this._tilingScheme
      );
  }

  get quadtree() { return this._quadtree; }
  set quadtree(q) { this._quadtree = q; }

  get ready() { return true; }
  get tilingScheme() { return this._tilingScheme; }
  get errorEvent() { return this._errorEvent; }

  beginUpdate() {}
  endUpdate() {}
  getLevelMaximumGeometricError(level) {
    return this._levelZeroMaximumError / (1 << level);
  }

  loadTile(frameState, tile) {
    if (tile.state === QuadtreeTileLoadState.START) {
      tile.data = {
        primitive: undefined,
        boundingSphere3D: undefined,
        freeResources() {
          if (this.primitive) {
            this.primitive.destroy();
            this.primitive = undefined;
          }
        }
      };

      // Compute tile center in cartographic
      const rect = tile.rectangle;
      const cartoCenter = new Cartographic(
        (rect.west + rect.east) / 2,
        (rect.south + rect.north) / 2,
        500 // half of box height
      );
      const centerCartesian = Cartesian3.fromRadians(
        cartoCenter.longitude,
        cartoCenter.latitude,
        cartoCenter.height
      );

      // Compute dimensions: approx box covering the tile’s ground extent
      const widthMeters =
        Cartesian3.distance(
          Cartesian3.fromRadians(rect.west, cartoCenter.latitude, 0),
          Cartesian3.fromRadians(rect.east, cartoCenter.latitude, 0)
        );
      const heightMeters =
        Cartesian3.distance(
          Cartesian3.fromRadians(cartoCenter.longitude, rect.south, 0),
          Cartesian3.fromRadians(cartoCenter.longitude, rect.north, 0)
        );

      const boxGeom = BoxGeometry.fromDimensions({
        dimensions: new Cartesian3(widthMeters, heightMeters, 1000), // 1 km tall
        vertexFormat: PerInstanceColorAppearance.FLAT_VERTEX_FORMAT
      });

      tile.data.primitive = new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: boxGeom,
          modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(centerCartesian),
          attributes: {
            color: ColorGeometryInstanceAttribute.fromColor(
              Color.fromRandom({ alpha: 0.6 })
            )
          }
        }),
        appearance: new PerInstanceColorAppearance({ flat: true, translucent: true }),
        asynchronous: false
      });

      tile.data.boundingSphere3D = BoundingSphere.fromCenterRadius(
        centerCartesian,
        Math.max(widthMeters, heightMeters) // safe sphere
      );

      tile.state = QuadtreeTileLoadState.LOADING;
    }

    if (tile.state === QuadtreeTileLoadState.LOADING) {
      tile.data.primitive.update(frameState);
      if (tile.data.primitive.ready) {
        tile.state = QuadtreeTileLoadState.DONE;
        tile.renderable = true;
      }
    }
  }

  computeTileVisibility(tile, frameState) {
    return frameState.cullingVolume.computeVisibility(tile.data.boundingSphere3D);
  }

  showTileThisFrame(tile, frameState) {
    tile.data.primitive.update(frameState);
  }

  computeDistanceToTile(tile, frameState) {
    const subtractScratch = new Cartesian3();
    const center = tile.data.boundingSphere3D.center;
    return Math.max(
      0.0,
      Cartesian3.magnitude(
        Cartesian3.subtract(center, frameState.camera.positionWC, subtractScratch)
      ) - tile.data.boundingSphere3D.radius
    );
  }

  isDestroyed() { return false; }
  destroy() { return destroyObject(this); }
}

export default BoxTileProvider;