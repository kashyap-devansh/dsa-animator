import ArraySearchPage from "../ArraySearchPage";
import { JUMP_CODE, jumpSearchSteps } from "../searchSteps";

const IDEA = {
  title: "Jump ahead, then walk back",
  body: "In a sorted row, leap forward a block of √n values at a time until a block's last value reaches the target. Then the target can only be inside that one block, so walk it one by one.",
  notice: "About √n jumps plus at most √n steps: O(√n), between linear and binary search.",
};

const JumpSearch = () => (
  <ArraySearchPage
    generate={jumpSearchSteps}
    idea={IDEA}
    code={JUMP_CODE}
    filename="jump_search.cpp"
    complexity={[
      { label: "time", value: "O(√n)" },
      { label: "space", value: "O(1)" },
    ]}
  />
);

export default JumpSearch;
