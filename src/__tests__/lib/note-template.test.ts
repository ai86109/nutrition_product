import { appendTemplate } from "@/lib/note-template"

describe("appendTemplate", () => {
  it("空字串時回傳模板內容本身", () => {
    expect(appendTemplate("", "範本A")).toBe("範本A")
  })

  it("全空白也視為空", () => {
    expect(appendTemplate("   \n\n", "範本A")).toBe("範本A")
  })

  it("非空字串時用單一換行串接", () => {
    expect(appendTemplate("已寫的備註", "範本A")).toBe("已寫的備註\n範本A")
  })

  it("既有結尾的換行被吸收，不會出現多個空行", () => {
    expect(appendTemplate("已寫的備註\n\n", "範本A")).toBe("已寫的備註\n範本A")
  })

  it("保留模板內部的換行", () => {
    expect(appendTemplate("第一行", "第二行\n第三行")).toBe(
      "第一行\n第二行\n第三行"
    )
  })

  it("連續呼叫可以堆疊", () => {
    const step1 = appendTemplate("", "A")
    const step2 = appendTemplate(step1, "B")
    expect(step2).toBe("A\nB")
  })
})
