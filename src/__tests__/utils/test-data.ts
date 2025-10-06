import { ApiProductData } from "@/types";

export const mockProducts: ApiProductData[] = [
  {
    "categories": [
      "均衡配方",
      "濃縮配方"
    ],
    "reviewStatus": "TRUE",
    "id": "1086036948",
    "name": "立攝適均康1.5熱量濃縮完整均衡營養配方香草口味",
    "engName": "RESOURCE 1.5 CAL (ACBL1001-1)",
    "brand": "雀巢",
    "type": "液劑",
    "spec": [
      {
        "type": "液劑",
        "unit": "罐",
        "defaultAmount": "1",
        "volume": "250"
      }
    ],
    "defaultAmount": "250",
    "ingredients": {
      "calories": 382.8,
      "carbohydrate": 47.5,
      "protein": 16,
      "fat": 14.8,
      "phosphorus": 192,
      "potassium": 450,
      "sodium": 250,
      "fiber": 3
    }
  },
  {
    "categories": [
      "均衡配方",
      "濃縮配方"
    ],
    "reviewStatus": "TRUE",
    "id": "1139093028",
    "name": "健力體1.2熱量濃縮含纖維質及果寡醣均衡營養配方",
    "engName": "Jevity Plus 1.2",
    "brand": "亞培",
    "type": "液劑",
    "spec": [
      {
        "type": "液劑",
        "unit": "罐",
        "defaultAmount": "1",
        "volume": "237"
      }
    ],
    "defaultAmount": "237",
    "ingredients": {
      "calories": 289,
      "carbohydrate": 40.9,
      "protein": 13.2,
      "fat": 9.3,
      "phosphorus": 190,
      "potassium": 438,
      "sodium": 299,
      "fiber": 5.2
    }
  }
]

export const mockProductContext = (products: ApiProductData[] = mockProducts) => {
  return {
    allProducts: products,
    productList: [],
    setProductList: jest.fn(),
    brandOptions: []
  }
}

export const productSearchHelper = {
  DEFAULT_FORM_STATE: {
    searchValue: "",
    selectedBrand: "",
    selectedType: "",
    selectedCate: ["", "", ""]
  }
};
