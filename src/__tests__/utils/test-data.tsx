import { ApiProductData, Gender, ProductData } from "@/types";
import { BioInfoProvider } from '@/contexts/BioInfoContext';
import { ProductProvider } from "@/contexts/ProductContext";

// bio info input
export const defaultHeight = 180;
export const defaultWeight = 70;
export const defaultAge = 30;
export const defaultGender = 'man';

// screen width
export const largeScreenWidth = 1800;
export const defaultScreenWidth = 1024;
export const smallScreenWidth = 800;

// mock product data
export const mockListData: ProductData[] = [
  {
    "id": "1086036948",
    "name": "立攝適均康1.5熱量濃縮完整均衡營養配方香草口味",
    "engName": "RESOURCE 1.5 CAL (ACBL1001-1)",
    "brand": "雀巢",
    "defaultAmount": 250,
    "quantity": 1,
    "checked": true,
    "select": {
      "selectedId": "can-1",
      "selectOptions": [
        {
          "unit": "罐",
          "products": [
            {
              "id": "can-1",
              "defaultAmount": 1,
              "volume": 250
            }
          ]
        }
      ]
    },
    "ingredients": {
      "calories": 382.8,
      "carbohydrate": 47.5,
      "protein": 16,
      "fat": 14.8,
      "phosphorus": 192,
      "potassium": 450,
      "sodium": 250,
      "fiber": 3
    },
    "categories": [
      "均衡配方",
      "濃縮配方"
    ]
  },
  {
    "id": "1139093028",
    "name": "健力體1.2熱量濃縮含纖維質及果寡醣均衡營養配方",
    "engName": "Jevity Plus 1.2",
    "brand": "亞培",
    "defaultAmount": 237,
    "quantity": 1,
    "checked": true,
    "select": {
      "selectedId": "can-1",
      "selectOptions": [
        {
          "unit": "罐",
          "products": [
            {
              "id": "can-1",
              "defaultAmount": 1,
              "volume": 237
            }
          ]
        }
      ]
    },
    "ingredients": {
      "calories": 289,
      "carbohydrate": 40.9,
      "protein": 13.2,
      "fat": 9.3,
      "phosphorus": 190,
      "potassium": 438,
      "sodium": 299,
      "fiber": 5.2
    },
    "categories": [
      "均衡配方",
      "濃縮配方"
    ]
  },
  {
    "id": "1139087708",
    "name": "寶灜康素佳纖優蛋白營養均衡完整配方",
    "engName": "BAOWIN Kealth Premium Fiber and Protein Formula",
    "brand": "寶灜",
    "defaultAmount": 57,
    "quantity": 1,
    "checked": true,
    "select": {
      "selectedId": "pack-1",
      "selectOptions": [
        {
          "unit": "包",
          "products": [
            {
              "id": "pack-1",
              "defaultAmount": 1,
              "volume": 23
            },
            {
              "id": "pack-2",
              "defaultAmount": 1,
              "volume": 34
            },
            {
              "id": "pack-3",
              "defaultAmount": 1,
              "volume": 46
            },
            {
              "id": "pack-4",
              "defaultAmount": 1,
              "volume": 57
            },
            {
              "id": "pack-5",
              "defaultAmount": 1,
              "volume": 69
            }
          ]
        },
        {
          "unit": "匙",
          "products": [
            {
              "id": "spoon-1",
              "defaultAmount": 2,
              "volume": 28.5
            }
          ]
        }
      ]
    },
    "ingredients": {
      "calories": 251,
      "carbohydrate": 33.6,
      "protein": 10.1,
      "fat": 9.3,
      "phosphorus": 171,
      "potassium": 314,
      "sodium": 209,
      "fiber": 3.8
    },
    "categories": [
      "均衡配方"
    ]
  }
]

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
  },
  {
    "categories": [
      "均衡配方"
    ],
    "reviewStatus": "TRUE",
    "id": "1139087708",
    "name": "寶灜康素佳纖優蛋白營養均衡完整配方",
    "engName": "BAOWIN Kealth Premium Fiber and Protein Formula",
    "brand": "寶灜",
    "type": "粉劑",
    "spec": [
      {
        "type": "粉劑",
        "unit": "包",
        "defaultAmount": "1",
        "volume": "23"
      },
      {
        "type": "粉劑",
        "unit": "包",
        "defaultAmount": "1",
        "volume": "34"
      },
      {
        "type": "粉劑",
        "unit": "包",
        "defaultAmount": "1",
        "volume": "46"
      },
      {
        "type": "粉劑",
        "unit": "包",
        "defaultAmount": "1",
        "volume": "57"
      },
      {
        "type": "粉劑",
        "unit": "包",
        "defaultAmount": "1",
        "volume": "69"
      },
      {
        "type": "粉劑",
        "unit": "匙",
        "defaultAmount": "2",
        "volume": "28.5"
      }
    ],
    "defaultAmount": "57",
    "ingredients": {
      "calories": 251,
      "carbohydrate": 33.6,
      "protein": 10.1,
      "fat": 9.3,
      "phosphorus": 171,
      "potassium": 314,
      "sodium": 209,
      "fiber": 3.8
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

// mock google sheet data
export const mockInfoData = [
  ['審核狀態', '許可證字號', '中文品名', '英文品名', '申請商名稱', '劑型', '類別'],
  ['TRUE', '1139091114', '測試產品', 'Test Product', '測試品牌', '液劑', '']
]

export const mockSpecData = [
  ['許可證字號', '中文品名', '預設份量', 'type', 'unit', 'defaultAmount', 'volume'],
  ['1139091114', '測試產品', '100g', '液劑', '罐', '100g', '100g']
]

export const mockIngredientsData = [
  ['許可證字號', '中文品名', 'calories', 'carbohydrate', 'protein', 'fat', 'phosphorus', 'potassium', 'sodium', 'fiber'],
  ['1139091114', '測試產品', '100', '20', '5', '0', '0', '0', '0', '0']
]

export const formattedMockFetchData = {
  id: '1139091114',
  name: '測試產品',
  engName: 'Test Product',
  brand: '測試品牌',
  type: '液劑',
  defaultAmount: '100g',
  reviewStatus: 'TRUE',
  categories: [],
  spec: [{
      defaultAmount: '100g',
      type: '液劑',
      unit: '罐',
      volume: '100g',
  }],
  ingredients: {
    calories: 100,
    protein: 5,
    fat: 0,
    carbohydrate: 20,
    phosphorus: 0,
    potassium: 0,
    sodium: 0,
    fiber: 0
  }
}

// bio info context
export const createBioInfoWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <BioInfoProvider>{children}</BioInfoProvider>
  );
};

export const defaultFormData = {
  height: "",
  weight: "",
  age: "",
};

export const defaultSubmittedValues = {
  height: 0,
  weight: 0,
  age: 0,
  gender: defaultGender,
};

// product context
export const createProductWrapper = (products: ApiProductData[] = mockProducts) => {
  return ({ children }: { children: React.ReactNode }) => (
    <ProductProvider allProducts={products}>{children}</ProductProvider>
  )
}