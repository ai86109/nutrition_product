type UnitMapping = {
  [key: string]: string;
};

export const unitMapping: UnitMapping = {
  "匙": "spoon",
  "包": "pack",
  "罐": "can"
}

type calcUnitMapping = {
  [key: string]: string;
};

export const calcUnitMapping: calcUnitMapping = {
  "匙": "g",
  "包": "g",
  "罐": "ml",
}

export const typeOptions = [
  { id: "全部", name: "全部" },
  { id: "粉劑", name: "粉劑" },
  { id: "液劑", name: "液劑" },
]

export const categoryOptions = [
  { id: "全部", name: "全部" },
  { id: "均衡配方", name: "均衡配方" },
  { id: "低蛋白配方", name: "低蛋白配方" },
  { id: "腎臟病配方", name: "腎臟病配方" },
  { id: "癌症配方", name: "癌症配方" },
  { id: "濃縮配方", name: "濃縮配方" },
  { id: "糖尿病配方", name: "糖尿病配方" },
  { id: "元素配方", name: "元素配方" },
  { id: "單素配方", name: "單素配方" },
]

export const operatorOptions = [
  { id: "or", name: "或" },
  { id: "and", name: "和" },
]