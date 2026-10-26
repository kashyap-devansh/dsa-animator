const MarqueeTrack = ({ items, wrapperClass, trackClass, itemClass }) => (
  <div className={wrapperClass}>
    <div className={trackClass}>
      {
        [...items, ...items].map((item, index) => (
          <span key={index} className={itemClass}>
            {item}
          </span>
        ))
      }
    </div>
  </div>
);

export default MarqueeTrack;
