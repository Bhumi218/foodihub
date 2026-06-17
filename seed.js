const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const Food = require('./models/Food');
const Restaurant = require('./models/Restaurant');

const restaurants = [
    { name: 'Pizza Paradise', category: 'pizza', rating: 4.8, deliveryTime: '25-30 min', discount: '20% OFF', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80', items: ['Margherita Pizza', 'Pepperoni Pizza'] },
    { name: 'Burger Bistro', category: 'burger', rating: 4.6, deliveryTime: '20-25 min', discount: '15% OFF', image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80', items: ['Classic Burger', 'Cheese Burger'] },
    { name: 'Biryani House', category: 'biryani', rating: 4.9, deliveryTime: '30-35 min', discount: '25% OFF', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80', items: ['Chicken Biryani', 'Mutton Biryani'] },
    { name: 'Dragon Wok', category: 'chinese', rating: 4.5, deliveryTime: '25-30 min', discount: '10% OFF', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', items: ['Veg Noodles', 'Fried Rice'] },
    { name: 'Sweet Tooth', category: 'desserts', rating: 4.7, deliveryTime: '20-25 min', discount: '30% OFF', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80', items: ['Chocolate Brownie', 'Ice Cream Sundae'] },
    { name: 'Juice Junction', category: 'drinks', rating: 4.4, deliveryTime: '15-20 min', discount: 'Free Delivery', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80', items: ['Fresh Orange Juice', 'Cold Coffee'] }
];

const foods = [
    { name: 'Margherita Pizza', price: 249, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&q=80', category: 'pizza', rating: 4.5 },
    { name: 'Pepperoni Pizza', price: 349, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&q=80', category: 'pizza', rating: 4.7 },
    { name: 'Classic Burger', price: 199, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80', category: 'burger', rating: 4.6 },
    { name: 'Cheese Burger', price: 249, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=300&q=80', category: 'burger', rating: 4.5 },
    { name: 'Chicken Biryani', price: 299, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80', category: 'biryani', rating: 4.9 },
    { name: 'Mutton Biryani', price: 399, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', category: 'biryani', rating: 4.8 },
    { name: 'Veg Noodles', price: 179, image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&q=80', category: 'chinese', rating: 4.3 },
    { name: 'Fried Rice', price: 199, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=80', category: 'chinese', rating: 4.4 },
    { name: 'Chocolate Brownie', price: 149, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&q=80', category: 'desserts', rating: 4.7 },
    { name: 'Ice Cream Sundae', price: 199, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&q=80', category: 'desserts', rating: 4.6 },
    { name: 'Fresh Orange Juice', price: 99, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80', category: 'drinks', rating: 4.2 },
    { name: 'Cold Coffee', price: 129, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&q=80', category: 'drinks', rating: 4.4 }
];

const seed = async () => {
    await connectDB();

    await Food.deleteMany({});
    await Restaurant.deleteMany({});

    const createdRestaurants = await Restaurant.insertMany(restaurants);
    const restaurantByCategory = createdRestaurants.reduce((map, restaurant) => {
        map[restaurant.category] = restaurant._id;
        return map;
    }, {});

    await Food.insertMany(foods.map(food => ({
        ...food,
        restaurantId: restaurantByCategory[food.category]
    })));

    console.log('Seed completed: restaurants and foods inserted.');
    process.exit(0);
};

seed().catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
});
