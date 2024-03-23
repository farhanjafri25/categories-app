"use client";
import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	Card,
	Checkbox,
	Container,
	FormControl,
	Heading,
	HStack,
	Input,
	InputGroup,
	Link,
	Text,
	Toast,
	useToast,
	VStack,
} from "@chakra-ui/react";
import { CONSTANTS } from "@/constants/constants";
import { ResponseInterface } from "@/interfaces/response.interface";

interface Category {
	category_id: string;
	category_name: string;
  id: number;
  isSelected: boolean;
}
// const token = localStorage.getItem("token");

export default function CategoryPage() {
  // const [token, setToken] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const pageSize = 6;
  const token = localStorage.getItem('token');
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

	async function fetchUserCategories(page: number) {
		try {
			if (page === null) {
				return;
			}
			const res = await fetch(
				`${CONSTANTS.category.apiUrls}?page=${page}&pageSize=${pageSize}`,
				{
					method: "GET",
					headers,
          credentials: "include",
				}
			);
			const result: ResponseInterface = await res.json();
			if (result.success) {
				setCategoryList(result?.data?.result);
				setCurrentPage(result.data.nextPage);
			} else {
				Toast({
					description: "Error Fetching Data",
					status: "error",
				});
			}
			return;
		} catch (error) {
			console.log("fetchUserCategories ~ error:", error);
		}
	}

	async function selectCategory(categoryId: string) {
    if (!categoryId) {
      return
    }
    const res = await fetch(`${CONSTANTS.category.apiUrls}`, {
      method: "POST",
      body: JSON.stringify({ category_id: categoryId }),
      headers,
      credentials: 'include'
    });
    const result: ResponseInterface = await res.json();
    if (result.success) {
      Toast({
        description: "Category saved successfully",
        status: 'success'
      })
      return;
    }
    Toast({
      description: "Error saving category",
      status: "error"
    })
    return;
  }

  async function removeCategory(categoryId: string) {
    if (!categoryId) {
      return
    }
    const res = await fetch(`${CONSTANTS.category.apiUrls}`, {
      method: "DELETE",
      body: JSON.stringify({ category_id: categoryId }),
      headers,
      credentials: 'include'
    });
    const result: ResponseInterface = await res.json();
    if (result.success) {
      Toast({
        description: "Category removed successfully",
        status: 'success'
      })
      return;
    }
    Toast({
      description: "Error deleting category",
      status: "error"
    })
    return;
  }
  
  function handleCheckboxChange(categoryId: string, isChecked: boolean) {
    if (isChecked) {
      selectCategory(categoryId);
    } else {
      removeCategory(categoryId);
    }
    const updatedCategoryList = categoryList.map((category) =>
      category.category_id === categoryId ? { ...category, isSelected: isChecked } : category
    );
    setCategoryList(updatedCategoryList);
    return;
  }

	function handleNextPage() {
		if (currentPage !== null) {
			fetchUserCategories(currentPage);
		}
	}

	function handlePreviousPage() {
		if (currentPage > 1) {
			const previousPage = currentPage - 2;
			fetchUserCategories(previousPage);
		}
	}

  useEffect(() => {
		fetchUserCategories(currentPage);
	}, []);

	return (
		<Container py={20} maxW={"2xl"}>
			<Heading size={"xl"} fontWeight={400} textAlign={"center"} mb={12}>
				Mark your interests
			</Heading>
			<Container maxW={450}>
				<Card
					bg={"white"}
					rounded={"xl"}
					maxW={450}
					p={8}
					border={"1px"}
					borderColor={"gray.200"}
					shadow={"none"}>
					<Heading size={"lg"} py={"3"}>
						Categories
					</Heading>
					<form>
						<VStack gap={3} alignItems={"flex-start"}>
							{categoryList &&
								categoryList?.map((ele) => (
									<Checkbox
                    key={ele?.category_id}
                    isChecked={ele?.isSelected}
										onChange={(e) => handleCheckboxChange(ele?.category_id, e.target.checked)}>
										{ele?.category_name}
									</Checkbox>
								))}
							<HStack>
								<Button
									onClick={handlePreviousPage}
									disabled={currentPage === 2}>
									Previous
								</Button>
								<Button
									onClick={handleNextPage}
									disabled={currentPage === null}>
									Next
								</Button>
							</HStack>
						</VStack>
					</form>
				</Card>
			</Container>
		</Container>
	);
}
