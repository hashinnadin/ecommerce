package main

import (
	"fmt"
	"log"
	"myapp/config"
	"myapp/src/database"
	"myapp/src/schema"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SeedProduct struct {
	Name        string
	Title       string
	Price       int64
	Category    string
	Description string
	MainImage   string
	Rating      float64
	Stock       int
}

func main() {
	cfg := config.LoadConfig()
	db := database.SetupDatabase(cfg)

	products := []SeedProduct{
		{
			Name:        "Straw Velvet Cake",
			Title:       "Straw Velvet Cake",
			Price:       800,
			Category:    "Premium",
			Description: "Soft strawberry velvet cake layered with rich cream.",
			MainImage:   "/cake/cake1.avif",
			Rating:      4.8,
			Stock:       50,
		},
		{
			Name:        "Choco Cream Cake",
			Title:       "Choco Cream Cake",
			Price:       750,
			Category:    "Classic",
			Description: "Rich chocolate sponge filled with creamy chocolate frosting.",
			MainImage:   "/cake/cake2.avif",
			Rating:      4.5,
			Stock:       40,
		},
		{
			Name:        "Black Forest Cake",
			Title:       "Black Forest Cake",
			Price:       900,
			Category:    "Premium",
			Description: "Classic German black forest with cherries and cream.",
			MainImage:   "/cake/cake3.avif",
			Rating:      4.9,
			Stock:       35,
		},
		{
			Name:        "Party Mix Cake",
			Title:       "Party Mix Cake",
			Price:       900,
			Category:    "Party",
			Description: "Colorful cake perfect for celebrations and birthdays.",
			MainImage:   "/cake/cake4.avif",
			Rating:      4.7,
			Stock:       30,
		},
		{
			Name:        "Creamy Delight",
			Title:       "Creamy Delight",
			Price:       500,
			Category:    "Classic",
			Description: "Light and creamy vanilla delicacy.",
			MainImage:   "/cake/cake5.webp",
			Rating:      4.3,
			Stock:       60,
		},
		{
			Name:        "Special Chocolate Cake",
			Title:       "Special Chocolate Cake",
			Price:       650,
			Category:    "Premium",
			Description: "Rich chocolate cake topped with dark chocolate glaze.",
			MainImage:   "/cake/cake6.jpg",
			Rating:      4.6,
			Stock:       45,
		},
		{
			Name:        "Strawberry Delight Cake",
			Title:       "Strawberry Delight Cake",
			Price:       780,
			Category:    "Fruit",
			Description: "Fresh strawberry cake topped with cream frosting.",
			MainImage:   "/cake/cake7.jpg",
			Rating:      4.4,
			Stock:       40,
		},
		{
			Name:        "Plum Cake",
			Title:       "Plum Cake",
			Price:       800,
			Category:    "Seasonal",
			Description: "Traditional plum cake with dry fruits and spices.",
			MainImage:   "/cake/cake8.jpg",
			Rating:      4.6,
			Stock:       25,
		},
		{
			Name:        "Butterscotch Milk Chocolate Cake",
			Title:       "Butterscotch Milk Chocolate Cake",
			Price:       850,
			Category:    "Special",
			Description: "Creamy butterscotch cake fused with milk chocolate.",
			MainImage:   "/cake/Butterscotch_MilkChocolateCake.webp",
			Rating:      4.7,
			Stock:       30,
		},
		{
			Name:        "Chocolate Strawberry Bento Cake",
			Title:       "Chocolate Strawberry Bento Cake",
			Price:       950,
			Category:    "Premium",
			Description: "Mini bento chocolate cake with fresh strawberry topping.",
			MainImage:   "/cake/Chocolate_StrawberryBentoCake.jpg",
			Rating:      4.8,
			Stock:       20,
		},
		{
			Name:        "Dark Chocolate Mousse Cake",
			Title:       "Dark Chocolate Mousse Cake",
			Price:       1000,
			Category:    "Premium",
			Description: "Smooth mousse layered with rich dark chocolate.",
			MainImage:   "/cake/DarkChocolateMousseCake.webp",
			Rating:      4.9,
			Stock:       15,
		},
		{
			Name:        "Dutch Truffle Cake Half KG",
			Title:       "Dutch Truffle Cake Half KG",
			Price:       800,
			Category:    "Premium",
			Description: "Chocolate truffle cake with silky ganache.",
			MainImage:   "/cake/DutchTruffleCakehalfkg.webp",
			Rating:      4.7,
			Stock:       35,
		},
		{
			Name:        "Eggless Dutch Truffle Cake Half KG",
			Title:       "Eggless Dutch Truffle Cake Half KG",
			Price:       780,
			Category:    "Eggless",
			Description: "Completely eggless chocolate truffle cake.",
			MainImage:   "/cake/EgglessDutchTruffleCakehalfkg.webp",
			Rating:      4.6,
			Stock:       30,
		},
		{
			Name:        "Eggless Dutch Truffle Cake 1 KG",
			Title:       "Eggless Dutch Truffle Cake 1 KG",
			Price:       1200,
			Category:    "Eggless",
			Description: "Large eggless truffle cake perfect for parties.",
			MainImage:   "/cake/EgglessDutchTruffleCakeonekg.webp",
			Rating:      4.8,
			Stock:       20,
		},
		{
			Name:        "Fresh Fruit Cream Cake",
			Title:       "Fresh Fruit Cream Cake",
			Price:       850,
			Category:    "Fruit",
			Description: "Seasonal mixed fruits layered over fresh cream.",
			MainImage:   "/cake/FreshFruit_CreamCake.webp",
			Rating:      4.7,
			Stock:       25,
		},
		{
			Name:        "Blueberry Cheesecake",
			Title:       "Blueberry Cheesecake",
			Price:       900,
			Category:    "Cheesecake",
			Description: "Creamy New York cheesecake topped with blueberry compote.",
			MainImage:   "/cake/HIGHRESBlueberryCheesecake-Square.webp",
			Rating:      4.8,
			Stock:       20,
		},
		{
			Name:        "New York Cheesecake",
			Title:       "New York Cheesecake",
			Price:       950,
			Category:    "Cheesecake",
			Description: "Classic New York style cheesecake with rich flavour.",
			MainImage:   "/cake/NewYorkCheeseCake1.webp",
			Rating:      4.9,
			Stock:       15,
		},
		{
			Name:        "Red Velvet Cake",
			Title:       "Red Velvet Cake",
			Price:       850,
			Category:    "Premium",
			Description: "Moist red velvet cake with smooth cream cheese frosting.",
			MainImage:   "/cake/RedVelvetCakehalfkg.jpg",
			Rating:      4.8,
			Stock:       40,
		},
		{
			Name:        "Strawberry Custard Cake",
			Title:       "Strawberry Custard Cake",
			Price:       750,
			Category:    "Fruit",
			Description: "Fresh strawberry and creamy custard combination.",
			MainImage:   "/cake/StrawberryCustardCake.webp",
			Rating:      4.5,
			Stock:       30,
		},
		{
			Name:        "Chocolate Cake",
			Title:       "Chocolate Cake",
			Price:       600,
			Category:    "Classic",
			Description: "A sweet, baked dessert made from flour, sugar, eggs, and fat.",
			MainImage:   "https://theovenchef.com/wp-content/uploads/2023/08/WhatsApp-Image-2023-11-01-at-5.39.28-PM-1-scaled-e1698841246352.jpeg",
			Rating:      4.5,
			Stock:       50,
		},
	}

	log.Println("🌱 Starting product seeding...")

	var inserted, skipped int
	for _, p := range products {
		// Check if product with same name already exists
		var count int64
		db.Model(&schema.Product{}).Where("name = ?", p.Name).Count(&count)
		if count > 0 {
			log.Printf("⏭  Skipping '%s' (already exists)", p.Name)
			skipped++
			continue
		}

		product := schema.Product{
			ID:        uuid.New(),
			Title:     p.Title,
			Name:      p.Name,
			Category:  p.Category,
			Description: p.Description,
			Price:     p.Price,
			Rating:    p.Rating,
			Stock:     p.Stock,
			InStock:   p.Stock > 0,
			MainImage: p.MainImage,
		}

		if err := db.Create(&product).Error; err != nil {
			log.Printf("❌ Failed to insert '%s': %v", p.Name, err)
			continue
		}

		log.Printf("✅ Inserted: %s (₹%d) [%s]", p.Name, p.Price, p.Category)
		inserted++
	}

	// Print summary
	fmt.Println("\n========================================")
	fmt.Printf("🌱 Seeding Complete!\n")
	fmt.Printf("   ✅ Inserted: %d products\n", inserted)
	fmt.Printf("   ⏭  Skipped:  %d products\n", skipped)
	fmt.Printf("   📦 Total:    %d products\n", inserted+skipped)
	fmt.Println("========================================")

	// Verify total count
	var total int64
	db.Model(&schema.Product{}).Where("deleted_at IS NULL").Count(&total)
	fmt.Printf("\n📊 Total products in database: %d\n", total)

	// Suppress unused import if needed
	_ = gorm.ErrRecordNotFound
}
