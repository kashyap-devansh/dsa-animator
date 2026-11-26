import { IsoScene } from "../../../iso/IsoParts";
import { Row, rowPoints, SLAB_D, ROW_GAP } from "../../../iso/IsoArray";
import { bounds } from "../../../iso/projection";

// A row of values above a row of buckets. A cell either sits in the row
// ({ pos }) or in a bucket ({ bucket, level }); its cube slides between them.
export const BUCKET_Y = -(SLAB_D + ROW_GAP);

const BucketScene = ({ cells, slots, buckets, bucketLabels, bucketHighlight = [], pointers, callouts, maxStack = 4, label }) => {
  const rowCells = cells.map((c) =>
    c.bucket !== undefined && c.bucket !== null ? { ...c, pos: c.bucket, dy: BUCKET_Y, lift: c.level, shadow: false } : { ...c, dy: 0, lift: c.lift ?? 0 }
  );

  const view = bounds(
    [
      ...rowPoints({ y: 0, slots: Math.max(slots, buckets), extraTop: 1.4 }),
      ...rowPoints({ y: BUCKET_Y, slots: buckets, extraTop: maxStack }),
    ],
    28
  );

  return (
    <IsoScene view={view} label={label}>
      <Row y={BUCKET_Y} cells={[]} slots={buckets} indexLabels={bucketLabels} indexHighlight={bucketHighlight} name="buckets" />
      <Row cells={rowCells} slots={slots} pointers={pointers} callouts={callouts} name="row" />
    </IsoScene>
  );
};

export default BucketScene;
