# Frontend WhatsApp Menu Website – Requirements Document

## 1. Project Overview
This project is a **front-end only menu website** that allows a business (restaurant/shop) to:
- Display products with details
- Modify products easily
- Create customer orders
- Send orders directly via **WhatsApp**

⚠️ The project must use **100% free tools** with **zero initial cost** and **no backend**.

---

## 2. Goals & Objectives
- No server-side code (frontend only)
- No paid services or APIs
- Easy product management
- Mobile-friendly UI
- Fast loading
- Simple deployment

---

## 3. Target Users
### 3.1 Business Owner (Admin)
- Updates products
- Adds/removes items
- Changes prices & descriptions

### 3.2 Customer
- Views menu
- Adds items to cart
- Sends order via WhatsApp

---

## 4. Tech Stack (Free Only)

### 4.1 Frontend
- HTML5
- CSS3 / Tailwind CSS
- JavaScript (Vanilla JS)

### 4.2 Data Storage
- Static JSON file (`products.json`)

### 4.3 Hosting
- GitHub Pages (recommended)
- OR Netlify / Vercel

### 4.4 External Services
- WhatsApp Click-to-Chat (`wa.me`)

---

## 5. Functional Requirements

### 5.1 Product Management
- Products must be stored in a JSON file
- Each product must include:
  - ID
  - Name
  - Price
  - Description
  - Image URL
- Products must be editable without changing JavaScript logic

#### Example Product Structure
```json
{
  "id": 1,
  "name": "Chicken Shawarma",
  "price": 60,
  "description": "Grilled chicken with garlic sauce",
  "image": "images/shawarma.jpg"
}
```

---

### 5.2 Menu Display
- Display all products dynamically
- Product card must show:
  - Image
  - Name
  - Price
  - Short description
- Fully responsive layout

---

### 5.3 Product Details
- Show detailed view (modal or separate section)
- Include:
  - Full description
  - Quantity selector
  - Add to cart button

---

### 5.4 Cart System
- Add/remove products
- Update quantities
- Display total price
- Persist cart during session (optional: `localStorage`)

---

### 5.5 Order Creation
- Collect:
  - Customer name
  - Phone number (optional)
  - Notes / address
- Generate formatted order summary

---

### 5.6 WhatsApp Integration
- Send order via WhatsApp without API approval
- Use WhatsApp Click-to-Chat URL

#### WhatsApp Message Format
```
Order Details:
- Product Name x Quantity = Price
Total: XX EGP

Customer Name:
Phone:
Notes:
```

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Fast load time
- Lightweight assets

### 6.2 Usability
- Simple navigation
- Mobile-first design
- Clear buttons & actions

### 6.3 Maintainability
- Clean folder structure
- Separate data from logic

---

## 7. Folder Structure
```
/menu-website
│── index.html
│── css/
│   └── style.css
│── js/
│   └── app.js
│── data/
│   └── products.json
│── images/
```

---

## 8. Constraints
- No backend
- No database
- No payment gateway
- No paid tools
- Static hosting only

---

## 9. Future Enhancements (Optional)
- Admin panel (Firebase free tier)
- Categories & filters
- Order history (local)
- Multi-language support

---

## 10. Success Criteria
- Website works fully on free hosting
- Products editable without code changes
- Orders sent successfully via WhatsApp
- Mobile-friendly UI

---

## 11. Deployment
- Upload project to GitHub repository
- Enable GitHub Pages
- Share public URL

---

## 12. Approval
This document defines all requirements needed to build the **Frontend WhatsApp Menu Website** using free tools only.

