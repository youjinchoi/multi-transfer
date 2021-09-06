import { calculateGasMargin, numberWithCommas } from "./utils";

describe("utils", () => {
  test("calculateGasMargin", () => {
    // falsy values
    expect(calculateGasMargin(null)).toEqual(null);
    expect(calculateGasMargin(undefined)).toEqual(null);
    expect(calculateGasMargin("")).toEqual(null);
    expect(calculateGasMargin(0)).toEqual("0");

    // truthy string values
    expect(calculateGasMargin("1")).toEqual("2");
    expect(calculateGasMargin("1.1")).toEqual("2");
    expect(calculateGasMargin("1.9")).toEqual("4");

    // truthy number values
    expect(calculateGasMargin(1)).toEqual("2");
    expect(calculateGasMargin(1.1)).toEqual("2");
    expect(calculateGasMargin(1.9)).toEqual("4");

    // with margin rate specified
    expect(calculateGasMargin("10", 1.5)).toEqual("15");
  })
  test("numberWithCommas", () => {
    // falsy values
    expect(numberWithCommas(null)).toEqual(null);
    expect(numberWithCommas(undefined)).toEqual(null);
    expect(numberWithCommas("")).toEqual(null);
    expect(numberWithCommas(NaN)).toEqual(null);
    expect(numberWithCommas(0)).toEqual("0");

    // without comma
    expect(numberWithCommas(100)).toEqual("100");
    expect(numberWithCommas("100")).toEqual("100");
    expect(numberWithCommas(100.999)).toEqual("100.999");
    expect(numberWithCommas("100.999")).toEqual("100.999");

    // with comma
    expect(numberWithCommas(100000)).toEqual("100,000");
    expect(numberWithCommas(100000.999)).toEqual("100,000.999");

    // negative values
    expect(numberWithCommas(-1)).toEqual("-1");
    expect(numberWithCommas("-1")).toEqual("-1");
    expect(numberWithCommas(-1.999)).toEqual("-1.999");
    expect(numberWithCommas("-1.999")).toEqual("-1.999");
    expect(numberWithCommas(-1000.999)).toEqual("-1,000.999");
    expect(numberWithCommas("-1000.999")).toEqual("-1,000.999");
  })
})
