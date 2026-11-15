/* Despensa catalogue — seeded from audited Chedraui receipts, Aug–Oct 2026.
   p = reference price MXN (latest known). q = usual quantity.
   hint = shop usually bought at (a sort hint, never a restriction).
   hist = known price points from receipts. */
var CATALOGUE_VERSION = 16;

/* Variant families — a DISPLAY grouping and nothing else. It never reaches
   Where it goes, price history or a trip record: a family is a way of
   drawing a list, not a thing that holds money. So a wrong fam is a
   cosmetic annoyance, never a number going quietly wrong.

   Set explicitly, never derived from the name: grouping by first word puts
   Papel Higiénico and Papel Aluminio in one family. The test is whether you
   would buy one INSTEAD of the other on a trip. */
var FAMS = {
  pollo:     "Pollo Rostizado",
  huevo:     "Huevo",
  oliva:     "Aceite de Oliva",
  arandano:  "Arándanos",
  pera:      "Pera",
  ciruela:   "Ciruela Pasa",
  crema:     "Crema de frutos secos",
  jarabe:    "Jarabe",
  mermeladas:"Mermelada",
  limon:     "Limón",
  lechveg:   "Leche vegetal",
  violife:   "Violife",
  jabon:     "Jabón",
  jugo:      "Jugo",
};

var CATS = [
  {id:"produce",  name:"Fruit & Veg",         ic:"leaf"},
  {id:"protein",  name:"Protein",             ic:"fish"},
  {id:"chilled",  name:"Dairy & Chilled",     ic:"milk"},
  {id:"bakery",   name:"Bakery & Tortillas",  ic:"bread"},
  {id:"pantry",   name:"Pantry",              ic:"box"},
  {id:"snacks",   name:"Snacks",              ic:"cookie"},
  {id:"drinks",   name:"Drinks",              ic:"glass"},
  {id:"home",     name:"Household",           ic:"spray"},
  {id:"care",     name:"Personal Care",       ic:"drop"},
  /* Bought once, not replenished: a thermos, a storage box, a trolley, a
     notebook. Household is the recurring supply — detergent, paper, bin
     bags — and mixing the two made MX$1,465 of one-time purchases read as
     ongoing cost. The test is frequency, not whether it is food: would you
     buy this again within a couple of months? No, and it belongs here.
     It stays inside the monthly budget; it is simply visible on its own,
     so an expensive month can be told apart from an expensive shop. */
  {id:"oneoff",   name:"One-offs",            ic:"tag"},
  /* Quick trips only. A quick run is a real basket nobody itemised, so
     "Mixed" is what it was, not an admission that data is missing — and
     it ranks by size like any other category, because a Mixed bar sitting
     above Protein is worth seeing, not worth hiding at the bottom.
     quickOnly keeps it out of every item picker: no jar of mustard is
     "Mixed". itemCats() is the filtered list; CATS stays whole so
     catName() and catIcon() can still resolve it. */
  {id:"mixed",    name:"Mixed",               ic:"cart", quickOnly:true}
];

var SHOPS = [
  {id:"chedraui", name:"Chedraui Puerto Aventuras", active:true},
  {id:"dac",      name:"DAC Quality Foods", active:true},
  {id:"market",   name:"Farmers market", active:true}
];

var ITEMS = [
/* ---------- Fruit & Veg ---------- */
{c:"produce", es:"Aguacate Hass", en:"Hass avocado", q:1, p:19.14, ref:"43.50/kg", hint:"chedraui",
  hist:[["2026-09-20",30.74],["2026-09-30",54.35],["2026-10-08",65.05],["2026-10-14",20.80],["2026-10-25",31.38],["2026-11-01",30.38],["2026-11-14",19.14]]},
{c:"produce", es:"Plátano Chiapas/Tabasco", en:"Banana — 14 Nov was one bundle weighed as two bags", q:1, p:50.08, ref:"31.50/kg", hint:"chedraui",
  hist:[["2026-09-13",24.61],["2026-09-20",26.81],["2026-09-30",18.48],["2026-10-08",25.88],["2026-10-14",18.34],["2026-10-25",27.45],["2026-11-01",30.04],["2026-11-14",50.08]]},
{c:"produce", es:"Manzana", en:"Apple — whichever is good", q:1, p:49.11, ref:"59.90/kg", hint:"chedraui",
  hist:[["2026-08-30",22.16],["2026-09-30",23.96],["2026-10-08",74.87],["2026-10-25",65.59],["2026-11-01",51.81],["2026-11-14",49.11]]},
{c:"produce", es:"Arándanos", fam:"arandano", en:"Blueberries", q:1, p:58.50, hint:"chedraui",
  hist:[["2026-09-20",58.50],["2026-09-30",58.50],["2026-10-08",58.50],["2026-10-25",58.50],["2026-11-01",58.50]]},
{c:"produce", es:"Arándanos Jumbo", fam:"arandano", en:"Blueberries — jumbo punnet", q:1, p:129.00, hint:"chedraui",
  hist:[["2026-11-14",129.00]]},
{c:"produce", es:"Durazno Rojo", en:"Red peach — quality permitting", q:1, p:60.88, ref:"99.00/kg", hint:"chedraui",
  hist:[["2026-08-16",60.88]]},
{c:"produce", es:"Piña Gota de Miel", en:"Pineapple", q:1, p:51.94, ref:"24.50/kg", hint:"chedraui",
  hist:[["2026-10-14",51.94]]},
{c:"produce", es:"Pera Mantequilla/Anjou", fam:"pera", en:"Anjou pear", q:1, p:41.25, ref:"80.90/kg", hint:"chedraui",
  hist:[["2026-10-14",32.80],["2026-10-25",41.25]]},
{c:"produce", es:"Pera Bartlett", fam:"pera", en:"Bartlett pear", q:1, p:41.33, ref:"88.90/kg", hint:"chedraui",
  hist:[["2026-11-14",41.33]]},
{c:"produce", es:"Tomate Saladette", en:"Roma tomato", q:1, p:38.78, ref:"72.50/kg", hint:"chedraui",
  hist:[["2026-09-05",5.83],["2026-09-20",20.08],["2026-09-30",24.68],["2026-10-08",21.26],["2026-10-14",15.90],["2026-10-25",22.54],["2026-11-01",33.66],["2026-11-14",38.78]]},
{c:"produce", es:"Calabaza Italiana", en:"Zucchini", q:1, p:9.46, ref:"24.90/kg", hint:"chedraui",
  hist:[["2026-09-20",21.59],["2026-09-30",26.02],["2026-10-08",11.08],["2026-10-14",9.46]]},
{c:"produce", es:"Papa Blanca Alpha", en:"White potatoes", q:1, p:94.49, ref:"64.50/kg", hint:"chedraui",
  hist:[["2026-10-14",94.49]]},
{c:"produce", es:"Baby Spinach Orgánica 142 g", en:"Organic baby spinach, 142 g tub", q:1, p:124.90, hint:"chedraui",
  hist:[["2026-10-14",124.90],["2026-10-25",124.90],["2026-11-01",124.90]]},
{c:"produce", es:"Baby Kale Orgánico 142 g", en:"Organic baby kale, 142 g tub", q:1, p:124.90, hint:"chedraui",
  hist:[["2026-11-14",124.90]]},
{c:"produce", es:"Espinacas", en:"Spinach, bunch", q:1, p:11.90, hint:"chedraui"},
{c:"produce", es:"Acelgas", en:"Chard, bunch", q:1, p:9.90, hint:"chedraui"},
{c:"produce", es:"Lechuga Italiana Viva", en:"Living lettuce — rings up as Lechuga Hidropónica", q:1, p:38.90, hint:"chedraui",
  hist:[["2026-09-05",39.10],["2026-09-13",39.10],["2026-11-01",38.90]]},
{c:"produce", es:"Champiñón Granel", en:"Mushrooms, loose", q:1, p:24.61, ref:"114.50/kg", hint:"chedraui"},
{c:"produce", es:"Seta Montebello 250 g", en:"Oyster mushrooms, 250 g tray", q:1, p:34.90, hint:"chedraui",
  hist:[["2026-10-25",34.90]]},
{c:"produce", es:"Cebolla Amarilla", en:"Yellow onion", q:1, p:25.41, ref:"60.50/kg", hint:"chedraui",
  hist:[["2026-11-01",25.41]]},
{c:"produce", es:"Ajo Granel", en:"Loose garlic", q:1, p:11.58, ref:"121.90/kg", hint:"chedraui",
  hist:[["2026-09-30",8.06],["2026-10-08",11.58]]},
{c:"produce", es:"Limón Eureka", fam:"limon", en:"Eureka lemon (yellow)", q:1, p:10.31, ref:"46.90/kg", hint:"chedraui",
  hist:[["2026-11-01",12.11],["2026-11-14",10.31]]},
{c:"produce", es:"Limón s/semilla", fam:"limon", en:"Seedless lime (green)", q:1, p:6.25, ref:"30.50/kg", hint:"chedraui",
  hist:[["2026-08-16",2.48],["2026-10-08",12.70],["2026-10-14",12.74],["2026-10-25",9.10],["2026-11-01",14.03],["2026-11-14",6.25]]},
{c:"produce", es:"Coco Tostado", en:"Toasted coconut", q:1, p:54.60, ref:"520.00/kg", hint:"chedraui",
  hist:[["2026-08-30",52.50],["2026-10-08",54.60]]},
{c:"produce", es:"Ciruela Pasa S/H", fam:"ciruela", en:"Prunes, pitted", q:1, p:59.60, ref:"298.00/kg", hint:"chedraui",
  hist:[["2026-08-16",61.09],["2026-08-30",61.09],["2026-10-08",61.09],["2026-11-14",59.60]]},
/* Stone-in, and a different thing at the scale: 210.00/kg against the
   pitted 298.00/kg. Two entries, because one history that alternates
   between them would read as a 30% price swing that never happened. */
{c:"produce", es:"Ciruela Pasa C/H", fam:"ciruela", en:"Prunes, stone-in", q:1, p:51.25, ref:"250.00/kg", hint:"chedraui",
  hist:[["2026-10-25",42.00],["2026-11-01",51.25]]},
{c:"produce", es:"Dátil Medjool", en:"Medjool dates", q:1, p:175.00, hint:"chedraui"},

/* ---------- Protein ---------- */
{c:"protein", es:"Salmón Atlántico", en:"Atlantic salmon", q:1, p:329.00, hint:"chedraui",
  hist:[["2026-09-05",329.00],["2026-09-20",329.00],["2026-09-30",329.00],["2026-10-08",329.00],["2026-11-01",329.00],["2026-11-14",329.00]]},
/* MX$989 and it is food protein, so Protein is where it belongs by the
   category's own test. It will spike that bar for one month; that is a
   real purchase, not a miscategorisation. */
{c:"protein", es:"Suplemento Alimenticio Chocolate", en:"Whey protein, chocolate", q:1, p:989.00, hint:"chedraui",
  hist:[["2026-11-14",989.00]]},
{c:"protein", es:"Pollo Rostizado Jumbo", fam:"pollo", en:"Rotisserie chicken — jumbo", q:1, p:149.00, hint:"chedraui",
  hist:[["2026-10-14",149.00]]},
{c:"protein", es:"Pollo Rostizado", fam:"pollo", en:"Rotisserie chicken", q:1, p:99.90, hint:"chedraui",
  hist:[["2026-08-16",99.90],["2026-08-30",99.90],["2026-09-13",99.90],["2026-10-08",99.90],["2026-10-25",99.90],["2026-11-01",99.90],["2026-11-14",99.90]]},
/* The 80.90 that used to sit here was "Huevo Webito 12 pz" on the 8 Oct
   receipt — a different brand that got name-matched into this entry and
   then read as a 161% price rise. The receipts carry four egg products
   (Criollo 18, Blanco 18, Blanco 12, Webito 12); only like goes with like. */
{c:"protein", es:"Huevo Blanco 12 pz", fam:"huevo", en:"Eggs, 12 ct — brand varies", q:1, p:32.00, hint:"chedraui",
  hist:[["2026-09-05",32.00],["2026-09-13",30.00],["2026-10-08",32.00],["2026-10-25",32.00]]},
{c:"protein", es:"Huevo Orgánico Blanco 12 pz", fam:"huevo", en:"Organic eggs, 12 ct", q:1, p:78.00, hint:"chedraui",
  hist:[["2026-11-01",78.00]]},
{c:"protein", es:"Huevo Cvivo Rojo 12 pz", fam:"huevo", en:"Brown eggs, 12 ct — Cvivo", q:1, p:87.00, hint:"chedraui",
  hist:[["2026-11-14",87.00]]},
{c:"protein", es:"Tofu firme House Foods", en:"Firm tofu, 396 g", q:1, p:109.04, hint:"dac"},
{c:"protein", es:"Carne al Pastor veggie", en:"Veggie al pastor, 450 g", q:1, p:100.92, hint:"dac"},
{c:"protein", es:"Hamburguesa de Yaca", en:"Jackfruit burger, 440 g", q:1, p:150.00, hint:"dac",
  hist:[["2026-10-14",129.92],["2026-10-25",150.00,"chedraui"],["2026-11-01",150.00,"chedraui"]]},
{c:"protein", es:"Garbanzo en Salmuera", en:"Chickpeas in brine", q:1, p:25.00, hint:"chedraui",
  hist:[["2026-10-14",25.00]]},
{c:"protein", es:"Frijoles Refritos Isadora", en:"Refried beans", q:2, p:17.00, hint:"chedraui",
  hist:[["2026-08-30",17.00],["2026-10-08",17.00]]},

/* ---------- Dairy & Chilled ---------- */
{c:"chilled", es:"Bionda Manchego", en:"Manchego cheese", q:1, p:125.00, hint:"chedraui",
  hist:[["2026-11-01",125.00],["2026-11-14",125.00]]},
{c:"chilled", es:"Violife Manchego", fam:"violife", en:"Vegan manchego", q:1, p:110.00, hint:"chedraui",
  hist:[["2026-08-08",94.00],["2026-10-08",110.00]]},
{c:"chilled", es:"Violife Panela", fam:"violife", en:"Vegan panela", q:1, p:94.00, hint:"chedraui",
  hist:[["2026-11-01",94.00]]},
{c:"chilled", es:"Leche de Almendra California Farms Vainilla 1.4 L", fam:"lechveg", en:"Vanilla almond milk, 1.4 L", q:1, p:145.00, hint:"chedraui",
  hist:[["2026-11-01",145.00],["2026-11-14",145.00]]},
{c:"chilled", es:"Leche de Soya Güd", fam:"lechveg", en:"Unsweetened soy milk, 1 L", q:2, p:61.48, hint:"dac"},
{c:"chilled", es:"Mantequilla Vegana", en:"Vegan butter, 100 g", q:1, p:71.92, hint:"dac"},

/* ---------- Bakery & Tortillas ---------- */
{c:"bakery", es:"Oroweat Multigrano", en:"Multigrain bread", q:1, p:93.00, hint:"chedraui",
  hist:[["2026-08-16",93.00],["2026-09-05",93.00],["2026-09-13",93.00],["2026-09-30",93.00],["2026-10-08",93.00],["2026-10-14",92.00],["2026-10-25",93.00],["2026-11-01",93.00]]},
{c:"bakery", es:"Tortilla Blanca 45 pz", en:"White corn tortillas, 45-pack", q:1, p:31.00, hint:"chedraui",
  hist:[["2026-09-05",38.00],["2026-09-30",38.00],["2026-10-14",31.00]]},

/* ---------- Pantry ---------- */
{c:"pantry", es:"Crema Almendra Sun Harvest", fam:"crema", en:"Almond butter, organic 454 g", q:1, p:198.00, hint:"chedraui",
  hist:[["2026-08-23",198.00],["2026-09-13",198.00],["2026-10-08",198.00]]},
{c:"pantry", es:"Crema Barney Almendra", fam:"crema", en:"Almond butter — Barney", q:1, p:278.00, hint:"chedraui",
  hist:[["2026-11-14",278.00]]},
{c:"pantry", es:"Crema Sun Harvest", fam:"crema", en:"Nut butter", q:1, p:145.00, hint:"chedraui",
  hist:[["2026-08-23",145.00],["2026-09-13",145.00],["2026-10-08",145.00],["2026-11-14",145.00]]},
{c:"pantry", es:"Crema de Cacahuate", fam:"crema", en:"Peanut butter — the cheaper shelf one", q:1, p:67.00, hint:"chedraui",
  hist:[["2026-10-25",69.00],["2026-11-01",67.00]]},
{c:"pantry", es:"Avena Orgánica", en:"Organic oats, 300 g", q:2, p:97.50, hint:"chedraui",
  hist:[["2026-08-16",97.50],["2026-08-30",97.50],["2026-10-08",97.50],["2026-11-01",97.50]]},
{c:"pantry", es:"Granola Miel de Agave", en:"Agave granola, 310 g — rings up as Granola Tía Ofilia", q:1, p:104.00, hint:"chedraui",
  hist:[["2026-08-16",104.00],["2026-08-30",104.00],["2026-11-01",104.00]]},
{c:"pantry", es:"Almendra Natural", en:"Natural almonds, 200 g", q:1, p:77.80, ref:"389.00/kg", hint:"chedraui",
  hist:[["2026-08-08",89.00],["2026-10-08",77.80]]},
{c:"pantry", es:"Cacahuates Mafer", en:"Peanuts — 3-for-2 promo runs often", q:2, p:52.50, hint:"chedraui",
  hist:[["2026-08-30",52.50],["2026-09-13",52.50]]},
{c:"pantry", es:"Cacahuate Garapiñado", en:"Candied peanuts", q:1, p:48.45, ref:"190.00/kg", hint:"chedraui",
  hist:[["2026-10-14",37.50],["2026-10-25",47.50],["2026-11-14",48.45]]},
{c:"pantry", es:"Quinoa", en:"Quinoa — brand varies", q:1, p:74.00, hint:"chedraui",
  hist:[["2026-09-05",71.00],["2026-09-30",74.00],["2026-10-08",74.00]]},
{c:"pantry", es:"Semillas de Chía", en:"Chia seeds — brand varies", q:1, p:158.00, hint:"chedraui",
  hist:[["2026-09-20",100.00],["2026-10-08",158.00],["2026-11-01",158.00]]},
{c:"pantry", es:"Pasta Rummo", en:"Rummo pasta — shape varies", q:1, p:84.00, hint:"chedraui",
  hist:[["2026-08-06",59.00],["2026-10-08",84.00]]},
{c:"pantry", es:"Jarabe Mister Maple", fam:"jarabe", en:"Maple syrup", q:1, p:172.00, hint:"chedraui",
  hist:[["2026-08-08",172.00],["2026-09-05",172.00]]},
{c:"pantry", es:"Jarabe de Agave", fam:"jarabe", en:"Agave syrup", q:1, p:84.00, hint:"chedraui",
  hist:[["2026-11-14",84.00]]},
{c:"pantry", es:"Miel 7 Colores 500", en:"Honey, 500 g", q:1, p:78.00, hint:"chedraui",
  hist:[["2026-11-14",78.00]]},
{c:"pantry", es:"Té Bigelow Limón", en:"Bigelow lemon tea", q:1, p:106.00, hint:"chedraui",
  hist:[["2026-11-14",106.00]]},
{c:"pantry", es:"Jarabe Aires del Campo Orgánico 236 ml", fam:"jarabe", en:"Organic maple syrup, 236 ml", q:1, p:200.00, hint:"chedraui",
  hist:[["2026-10-25",200.00]]},
{c:"pantry", es:"Mermelada", fam:"mermeladas", en:"Jam — flavour varies", q:1, p:84.00, hint:"chedraui",
  hist:[["2026-08-16",84.00],["2026-09-13",75.01]]},
{c:"pantry", es:"Mermelada Bonne Maman Cereza 370 g", fam:"mermeladas", en:"Cherry preserve, 370 g", q:1, p:149.00, hint:"chedraui",
  hist:[["2026-11-14",149.00]]},
{c:"pantry", es:"Corazones de Alcachofa Pasiega", en:"Artichoke hearts, jarred", q:1, p:72.50, hint:"chedraui",
  hist:[["2026-11-01",72.50]]},
{c:"pantry", es:"Salsa BBQ Sweet Baby Ray's 28 oz", en:"Barbecue sauce", q:1, p:109.00, hint:"chedraui",
  hist:[["2026-11-01",109.00]]},
{c:"pantry", es:"Aceituna Serpis Kalamata", en:"Kalamata olives", q:1, p:78.00, hint:"chedraui",
  hist:[["2026-10-25",78.00],["2026-11-01",78.00],["2026-11-14",78.00]]},
{c:"pantry", es:"Chile Chipotle La Chata", en:"Chipotle chillies, 215 g", q:1, p:60.00, hint:"chedraui"},
{c:"pantry", es:"Vinagre", en:"Vinegar, large", q:1, p:35.00, hint:"chedraui",
  hist:[["2026-09-05",13.00],["2026-09-30",35.00],["2026-10-08",35.00]]},
{c:"pantry", es:"Aceite de Coco Aires del Campo", en:"Coconut oil", q:1, p:140.00, hint:"chedraui"},
/* The 13 Sep point at 199.00 is left here because nobody knows which bottle
   it was. It may belong on the larger entry; against the 125.00 below it
   reads as a 37% fall that probably never happened. Move it when the size
   is known rather than guessing it now. */
{c:"pantry", es:"Aceite de Oliva", fam:"oliva", en:"Olive oil — the regular bottle", q:1, p:125.00, hint:"chedraui",
  hist:[["2026-09-13",199.00],["2026-10-08",125.00]]},
{c:"pantry", es:"Aceite de Oliva Grande", fam:"oliva", en:"Olive oil — the larger bottle (Carbonell)", q:1, p:212.00, hint:"chedraui",
  hist:[["2026-11-01",212.00]]},
{c:"pantry", es:"Sal Rosa Alta", en:"Pink salt, 400 g", q:1, p:179.00, hint:"chedraui",
  hist:[["2026-11-01",179.00]]},
{c:"pantry", es:"Sazonador Moe’s", en:"Seasoning blend", q:1, p:44.00, hint:"chedraui",
  hist:[["2026-08-23",44.00],["2026-10-08",44.00]]},
{c:"pantry", es:"Azúcar Zulka", en:"Cane sugar, 500 g", q:1, p:23.50, hint:"chedraui",
  hist:[["2026-08-23",25.00],["2026-08-30",23.50]]},
{c:"pantry", es:"Maíz Palomero", en:"Popcorn kernels", q:1, p:19.00, hint:"chedraui",
  hist:[["2026-09-05",15.00],["2026-10-08",19.00]]},
{c:"pantry", es:"Salsa Macha", en:"Salsa macha", q:1, p:133.00, hint:"chedraui"},

/* ---------- Snacks ---------- */
{c:"snacks", es:"Papa Chips", en:"Crisps — flavour varies", q:1, p:61.00, hint:"chedraui",
  hist:[["2026-08-16",61.00],["2026-08-30",61.00],["2026-09-13",61.00],["2026-10-08",61.00]]},
{c:"snacks", es:"Galleta Lotus Biscoff", en:"Biscoff cookies", q:1, p:82.00, hint:"chedraui",
  hist:[["2026-09-05",83.00],["2026-10-08",82.00]]},
{c:"snacks", es:"Totopos", en:"Tortilla chips, 500 g", q:1, p:39.00, hint:"chedraui",
  hist:[["2026-10-25",31.00],["2026-11-01",39.00],["2026-11-14",39.00]]},

/* ---------- Drinks ---------- */
{c:"drinks", es:"Licor Cointreau", en:"Cointreau liqueur, 700 ml", q:1, p:739.00, hint:"chedraui",
  hist:[["2026-10-14",739.00]]},
{c:"drinks", es:"Prosecco Maschio 750", en:"Prosecco — shelf price, discounts vary", q:1, p:295.00, hint:"chedraui",
  hist:[["2026-09-15",258.00],["2026-09-30",258.00],["2026-11-01",295.00],["2026-11-14",295.00]]},
{c:"drinks", es:"Tequila Azul 700 ml", en:"Tequila", q:1, p:199.00, hint:"chedraui"},
{c:"drinks", es:"Cerveza Barrilito", en:"Barrilito beer, 6-pack", q:1, p:64.00, hint:"chedraui",
  hist:[["2026-08-16",59.00],["2026-08-30",64.00],["2026-10-08",64.00]]},
{c:"drinks", es:"Jugo de naranja", fam:"jugo", en:"Orange juice", q:1, p:75.00, hint:"market"},
{c:"drinks", es:"Jugo de toronja", fam:"jugo", en:"Grapefruit juice", q:1, p:75.00, hint:"market"},

/* ---------- Household ---------- */
{c:"home", es:"Detergente Tide", en:"Laundry detergent", q:1, p:450.00, hint:"chedraui",
  hist:[["2026-08-08",395.00],["2026-10-08",450.00]]},
{c:"home", es:"Papel Higiénico", en:"Toilet paper", q:1, p:219.00, hint:"chedraui",
  hist:[["2026-08-08",205.00],["2026-09-30",249.00],["2026-11-14",219.00]]},
{c:"home", es:"Lysol Crisp Linen", en:"Disinfectant spray", q:1, p:169.00, hint:"chedraui"},
{c:"home", es:"Limpiador de Cocina", en:"Kitchen cleaner", q:1, p:73.00, hint:"chedraui",
  hist:[["2026-10-25",73.00]]},
{c:"home", es:"Limpiador de Baños", en:"Bathroom cleaner", q:1, p:67.00, hint:"chedraui",
  hist:[["2026-11-01",67.00]]},
{c:"home", es:"Harpic", en:"Toilet cleaner", q:1, p:59.00, hint:"chedraui"},
{c:"home", es:"Windex", en:"Glass cleaner", q:1, p:55.00, hint:"chedraui"},
{c:"home", es:"Fabuloso Lavanda 2L", en:"Multi-surface cleaner", q:1, p:55.00, hint:"chedraui"},
{c:"home", es:"Axion Limón", en:"Dish soap, 900 ml", q:1, p:57.00, hint:"chedraui",
  hist:[["2026-08-08",34.50],["2026-10-08",57.00]]},
{c:"home", es:"Toallas de Papel", en:"Paper towels", q:1, p:54.00, hint:"chedraui",
  hist:[["2026-08-30",51.00],["2026-09-30",49.00],["2026-10-25",45.00],["2026-11-01",33.00],["2026-11-14",54.00]]},
{c:"home", es:"Papel Aluminio Rey", en:"Aluminium foil", q:1, p:59.00, hint:"chedraui",
  hist:[["2026-11-14",59.00]]},
{c:"home", es:"Papel Encerado 10 m", en:"Waxed paper", q:1, p:54.00, hint:"chedraui"},
{c:"home", es:"Plástico Autoadherible 20 m", en:"Cling film, 20 m", q:1, p:27.50, hint:"chedraui",
  hist:[["2026-10-25",27.50]]},
{c:"home", es:"Bolsas de basura", en:"Trash bags, large", q:1, p:48.50, hint:"chedraui",
  hist:[["2026-09-13",48.50],["2026-09-30",48.50],["2026-10-08",48.50],["2026-11-14",48.50]]},
{c:"oneoff", es:"Bolsa Reutilizable", en:"Reusable checkout bag", q:3, p:2.00, hint:"chedraui",
  hist:[["2026-10-14",2.00]]},
{c:"oneoff", es:"Tabla para Picar 34 cm", en:"Chopping board, 34 cm", q:1, p:159.00, hint:"chedraui",
  hist:[["2026-10-25",159.00]]},
{c:"home", es:"Bolsas eco chicas", en:"Trash bags, small", q:1, p:29.50, hint:"chedraui"},
{c:"home", es:"Fibra Esponja Scotch-Brite", en:"Scouring sponge", q:1, p:73.00, hint:"chedraui"},
{c:"home", es:"Ziploc Congelación", en:"Freezer bags", q:1, p:78.00, hint:"chedraui",
  hist:[["2026-11-14",78.00]]},
{c:"home", es:"Baygon Total", en:"Insecticide", q:1, p:65.00, hint:"chedraui"},

/* ---------- Personal Care ---------- */
{c:"care", es:"Loción Protectora", en:"Sunscreen", q:1, p:287.00, hint:"chedraui",
  hist:[["2026-08-08",287.00],["2026-08-30",287.00],["2026-11-14",287.00]]},
{c:"care", es:"Jabón Líquido", fam:"jabon", en:"Hand soap", q:1, p:78.00, hint:"chedraui"},
{c:"care", es:"Enjuague Listerine", en:"Mouthwash", q:1, p:98.00, hint:"chedraui"},
{c:"care", es:"Kleenex Gel 450 ml", en:"Hand gel", q:1, p:54.00, hint:"chedraui"},
{c:"care", es:"Desodorante", en:"Deodorant", q:1, p:97.00, hint:"chedraui",
  hist:[["2026-11-01",97.00]]},
{c:"care", es:"Jabón de Barra", fam:"jabon", en:"Bar soap", q:1, p:21.00, hint:"chedraui"},
{c:"care", es:"Jabón Tocador Eucalipto 120 g", fam:"jabon", en:"Eucalyptus bath soap, 120 g", q:1, p:56.00, hint:"chedraui",
  hist:[["2026-11-14",56.00]]},
{c:"care", es:"Crema Dental Sensodyne", en:"Sensodyne toothpaste", q:2, p:145.00, hint:"chedraui",
  hist:[["2026-11-14",145.00]]},
{c:"care", es:"Tylenol C. 500 mg", en:"Tylenol, 500 mg", q:1, p:129.00, hint:"chedraui",
  hist:[["2026-11-14",129.00]]},
{c:"care", es:"Advil 200 mg 24 grageas", en:"Advil, 200 mg x24", q:1, p:79.90, hint:"chedraui",
  hist:[["2026-11-14",79.90]]}
];
