import { ResponseInterface } from "@/interfaces/response.interface";
import { NextResponse } from "next/server";

export function prepareResponse({
    data = null,
    message = "OK",
    code = 200,
  }: {
    data?: any;
    message?: string;
    code?: number;
  }) {
    const success = code < 400 ? true : false;
    return NextResponse.json<ResponseInterface>(
      {
        code,
        success,
        message,
        data,
      },
      {
        status: code,
      }
    );
}
  
export function mergeUserAndCategoryData(userSelectedCategories: any, categories: any) {
  const mergedData = categories.map((category: any) => ({
    ...category,
    isSelected: userSelectedCategories.some(
      (selectedCategory: any) => selectedCategory.category_id === category.category_id
    ),
  }));
  return mergedData;
}