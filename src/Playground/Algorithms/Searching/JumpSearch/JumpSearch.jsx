import ArraySearchPage from "../ArraySearchPage";
import { JUMP_CODE, jumpSearchSteps } from "../searchSteps";

const JumpSearch = () => (
  <ArraySearchPage
    generate={jumpSearchSteps}
    title="Jump Search"
    blurb="Leap ahead √n elements at a time until a block's last value reaches the target, then walk that one block linearly."
    complexity={[
      { label: "time", value: "O(√n)", tone: "time" },
      { label: "space", value: "O(1)", tone: "space" },
    ]}
    filename="jump_search.cpp"
    code={JUMP_CODE}
  />
);

export default JumpSearch;
