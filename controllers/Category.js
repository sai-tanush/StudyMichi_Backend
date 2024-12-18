const Category = require("../models/Category");

//createCategory handler function
exports.createCategory = async (req, res) => {
  try {
    //fetch data
    const { name, description } = req.body;

    //validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //create entry in DB
    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(categoryDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Category created successfully!",
    });
  } catch (error) {
    console.log(error);
    return res(500).json({
      success: false,
      message: "Error while creating Category",
    });
  }
};

//getAllCategories handler function
exports.getAllCategories = async (req, res) => {
  try {
    //fetch all Categories
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    //return response
    res.status(200).json({
      success: true,
      message: "All Categories fetched successfully",
      allCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: true,
      message: "Error while fetching data",
    });
  }
};

//categoryPageDetails Handler function
exports.categoryPageDetails = async (req, res) => {
  try {
    //fetch categoryId from req.body
    const { categoryId } = req.body;

    // Get courses for the specified category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    console.log(selectedCategory);

    // Handle the case when the category is not found
    if (!selectedCategory) {
      console.log("Category not found.");
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Handle the case when there are no courses
    if (selectedCategory.courses.length === 0) {
      console.log("No courses found for the selected category.");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    const selectedCourses = selectedCategory.courses;

    // Get courses for other categories
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    }).populate("courses");
    let differentCourses = [];
    for (const category of categoriesExceptSelected) {
      differentCourses.push(...category.courses);
    }

    // Get top-selling courses across all categories
    const allCategories = await Category.find().populate("courses");
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    //return response
    res.status(200).json({
      success: true,
      data: {
        selectedCourses: selectedCourses,
        differentCourses: differentCourses,
        mostSellingCourses: mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
