/**
 * INDONESIAN RETAIL SHELF PRODUCTS DATABASE
 * Authentic grocery product pricing from Indomaret, Alfamart, Hypermart & Super Indo
 */

const SHELF_PRODUCTS = [
  // 1. Staples / Bahan Pokok
  { id: 'sh_01', name: 'Beras Ramos Premium 5kg', category: 'Bahan Pokok', unit: 'pack', price: 74500, retailer: 'Indomaret' },
  { id: 'sh_02', name: 'Beras Pandan Wangi 5kg', category: 'Bahan Pokok', unit: 'pack', price: 88000, retailer: 'Super Indo' },
  { id: 'sh_03', name: 'Minyak Goreng Tropical Botol 2L', category: 'Bahan Pokok', unit: 'liter', price: 38500, retailer: 'Indomaret' },
  { id: 'sh_04', name: 'Minyak Goreng Sania Pouch 2L', category: 'Bahan Pokok', unit: 'liter', price: 36900, retailer: 'Alfamart' },
  { id: 'sh_05', name: 'Minyak Goreng Bimoli Klasik 2L', category: 'Bahan Pokok', unit: 'liter', price: 39500, retailer: 'Hypermart' },
  { id: 'sh_06', name: 'Telur Ayam Negeri 1kg (10-16 btr)', category: 'Bahan Pokok', unit: 'kg', price: 29500, retailer: 'Super Indo' },
  { id: 'sh_07', name: 'Gula Pasir Gulaku Tebu 1kg', category: 'Bahan Pokok', unit: 'kg', price: 18500, retailer: 'Alfamart' },
  { id: 'sh_08', name: 'Tepung Terigu Segitiga Biru 1kg', category: 'Bahan Pokok', unit: 'kg', price: 14000, retailer: 'Indomaret' },
  { id: 'sh_09', name: 'Garam Beryodium Cap Kapal 250g', category: 'Bahan Pokok', unit: 'pack', price: 4500, retailer: 'Indomaret' },
  { id: 'sh_10', name: 'Mentega Blue Band Serbaguna 200g', category: 'Bahan Pokok', unit: 'pack', price: 11500, retailer: 'Alfamart' },

  // 2. Instant Food & Seasonings
  { id: 'sh_11', name: 'Indomie Goreng Original 85g', category: 'Makanan Instan', unit: 'pack', price: 3100, retailer: 'Indomaret' },
  { id: 'sh_12', name: 'Indomie Kuah Ayam Bawang 69g', category: 'Makanan Instan', unit: 'pack', price: 3000, retailer: 'Alfamart' },
  { id: 'sh_13', name: 'Mie Sedaap Goreng Ayam Krispi 88g', category: 'Makanan Instan', unit: 'pack', price: 3100, retailer: 'Alfamart' },
  { id: 'sh_14', name: 'Pop Mie Rasa Ayam Bawang Cup 75g', category: 'Makanan Instan', unit: 'cup', price: 5500, retailer: 'Indomaret' },
  { id: 'sh_15', name: 'Sarden ABC Saus Tomat 155g', category: 'Makanan Instan', unit: 'kaleng', price: 12500, retailer: 'Super Indo' },
  { id: 'sh_16', name: 'Kornet Daging Sapi Pronas 198g', category: 'Makanan Instan', unit: 'kaleng', price: 26000, retailer: 'Hypermart' },
  { id: 'sh_17', name: 'Kecap Manis Bango Refill 520ml', category: 'Makanan Instan', unit: 'pouch', price: 25500, retailer: 'Indomaret' },
  { id: 'sh_18', name: 'Saus Sambal Extra Pedas ABC 335ml', category: 'Makanan Instan', unit: 'botol', price: 16500, retailer: 'Alfamart' },
  { id: 'sh_19', name: 'Royco Kaldu Ayam 230g', category: 'Makanan Instan', unit: 'pack', price: 10500, retailer: 'Super Indo' },

  // 3. Drinks & Dairy
  { id: 'sh_20', name: 'Susu UHT Ultra Milk Full Cream 1000ml', category: 'Minuman & Susu', unit: 'kotak', price: 21000, retailer: 'Super Indo' },
  { id: 'sh_21', name: 'Susu UHT Indomilk Cokelat 950ml', category: 'Minuman & Susu', unit: 'kotak', price: 19500, retailer: 'Indomaret' },
  { id: 'sh_22', name: 'Susu Kental Manis Frisian Flag Kaleng 370g', category: 'Minuman & Susu', unit: 'kaleng', price: 13500, retailer: 'Alfamart' },
  { id: 'sh_23', name: 'Kopi Kapal Api Spesial Mix 10x24g', category: 'Minuman & Susu', unit: 'pack', price: 15500, retailer: 'Indomaret' },
  { id: 'sh_24', name: 'Teh Celup Sariwangi Kotak isi 30', category: 'Minuman & Susu', unit: 'kotak', price: 8500, retailer: 'Alfamart' },
  { id: 'sh_25', name: 'Teh Botol Sosro Kotak 250ml', category: 'Minuman & Susu', unit: 'kotak', price: 3800, retailer: 'Indomaret' },
  { id: 'sh_26', name: 'Air Mineral Aqua Botol Besar 1500ml', category: 'Minuman & Susu', unit: 'botol', price: 6800, retailer: 'Alfamart' },
  { id: 'sh_27', name: 'Air Mineral Le Minerale 1500ml', category: 'Minuman & Susu', unit: 'botol', price: 6500, retailer: 'Super Indo' },
  { id: 'sh_28', name: 'Yakult Minuman Probiotik Pack isi 5', category: 'Minuman & Susu', unit: 'pack', price: 11500, retailer: 'Alfamart' },

  // 4. Toiletries & Personal Care
  { id: 'sh_29', name: 'Sabun Cair Lifebuoy Total 10 Refill 450ml', category: 'Perlengkapan Mandi', unit: 'pouch', price: 23500, retailer: 'Indomaret' },
  { id: 'sh_30', name: 'Sabun Mandi Biore Pure Mild Refill 400ml', category: 'Perlengkapan Mandi', unit: 'pouch', price: 26000, retailer: 'Super Indo' },
  { id: 'sh_31', name: 'Shampoo Sunsilk Black Shine Botol 160ml', category: 'Perlengkapan Mandi', unit: 'botol', price: 24500, retailer: 'Alfamart' },
  { id: 'sh_32', name: 'Shampoo Clear Men Cool Sport Botol 160ml', category: 'Perlengkapan Mandi', unit: 'botol', price: 28500, retailer: 'Indomaret' },
  { id: 'sh_33', name: 'Pasta Gigi Pepsodent Pencegah Gigi Berlubang 190g', category: 'Perlengkapan Mandi', unit: 'tube', price: 15500, retailer: 'Indomaret' },
  { id: 'sh_34', name: 'Sikat Gigi Formula Double Action 3 pcs', category: 'Perlengkapan Mandi', unit: 'pack', price: 12500, retailer: 'Alfamart' },
  { id: 'sh_35', name: 'Deodorant Rexona Men Ice Cool Roll On 45ml', category: 'Perlengkapan Mandi', unit: 'botol', price: 21000, retailer: 'Alfamart' },

  // 5. Laundry & Household
  { id: 'sh_36', name: 'Deterjen Bubuk Rinso Molto Rose Fresh 770g', category: 'Perlengkapan Cuci', unit: 'pack', price: 23500, retailer: 'Super Indo' },
  { id: 'sh_37', name: 'Deterjen Cair Attack Hygiene Plus Refill 750ml', category: 'Perlengkapan Cuci', unit: 'pouch', price: 24900, retailer: 'Indomaret' },
  { id: 'sh_38', name: 'Pelembut Pakaian Downy Sunrise Fresh Refill 650ml', category: 'Perlengkapan Cuci', unit: 'pouch', price: 27000, retailer: 'Alfamart' },
  { id: 'sh_39', name: 'Sabun Cuci Piring Sunlight Jeruk Nipis 700ml', category: 'Perlengkapan Cuci', unit: 'pouch', price: 15500, retailer: 'Indomaret' },
  { id: 'sh_40', name: 'Pembersih Lantai So Klin Aroma Apel Pouch 780ml', category: 'Perlengkapan Cuci', unit: 'pouch', price: 12000, retailer: 'Super Indo' },
  { id: 'sh_41', name: 'Tisu Wajah Paseo Smart Soft Pack 250 Sheets', category: 'Perlengkapan Cuci', unit: 'pack', price: 18500, retailer: 'Indomaret' },

  // 6. Snacks
  { id: 'sh_42', name: 'Biskuit Roma Kelapa Pack 300g', category: 'Camilan', unit: 'pack', price: 11500, retailer: 'Alfamart' },
  { id: 'sh_43', name: 'Oreo Sandwich Vanilla Roll 133g', category: 'Camilan', unit: 'pack', price: 9800, retailer: 'Indomaret' },
  { id: 'sh_44', name: 'Keripik Kentang Chitato Sapi Panggang 68g', category: 'Camilan', unit: 'pack', price: 11500, retailer: 'Indomaret' },
  { id: 'sh_45', name: 'Chiki Balls Keju Snack 55g', category: 'Camilan', unit: 'pack', price: 6500, retailer: 'Alfamart' },
  { id: 'sh_46', name: 'Cokelat SilverQueen Cashew Chunky Bar 95g', category: 'Camilan', unit: 'batang', price: 26000, retailer: 'Super Indo' }
];
