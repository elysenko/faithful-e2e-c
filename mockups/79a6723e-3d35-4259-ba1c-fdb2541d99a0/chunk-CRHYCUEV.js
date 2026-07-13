import{a as p,b as f}from"./chunk-PXZ455QI.js";import{a as s,b as h,c as d,e as a,ha as c,ia as m,m as u,p as l}from"./chunk-M6EWIR6V.js";var R=(()=>{class r{constructor(t,e){this.http=t,this.auth=e,this.base=`${p.apiUrl}/recipes`,this.demoStore=k.map(i=>s({},i))}list(t,e){if(this.auth.isDemo()){let n=(t??"").trim().toLowerCase(),b=this.demoStore.filter(o=>e?o.isFavorite:!0).filter(o=>n?o.title.toLowerCase().includes(n):!0).map(({id:o,title:v,isFavorite:w})=>({id:o,title:v,isFavorite:w}));return a(b)}let i=new c;return t&&t.trim()&&(i=i.set("q",t.trim())),e&&(i=i.set("favorite","1")),this.http.get(this.base,{params:i})}get(t){if(this.auth.isDemo()){let e=this.demoStore.find(i=>i.id===t);return e?a(s({},e)):g()}return this.http.get(`${this.base}/${t}`)}create(t){if(this.auth.isDemo()){let e={id:`demo-${this.demoStore.length+1}-${t.title.length}`,title:t.title,ingredients:t.ingredients,steps:t.steps,isFavorite:!1};return this.demoStore=[e,...this.demoStore],a(s({},e))}return this.http.post(this.base,t)}update(t,e){if(this.auth.isDemo()){this.demoStore=this.demoStore.map(n=>n.id===t?s(s({},n),e):n);let i=this.demoStore.find(n=>n.id===t);return i?a(s({},i)):g()}return this.http.patch(`${this.base}/${t}`,e)}toggleFavorite(t){if(this.auth.isDemo()){let e=!1;return this.demoStore=this.demoStore.map(i=>i.id!==t?i:(e=!i.isFavorite,h(s({},i),{isFavorite:e}))),a({id:t,isFavorite:e})}return this.http.patch(`${this.base}/${t}/favorite`,{})}remove(t){return this.auth.isDemo()?(this.demoStore=this.demoStore.filter(e=>e.id!==t),a(void 0)):this.http.delete(`${this.base}/${t}`)}static{this.\u0275fac=function(e){return new(e||r)(l(m),l(f))}}static{this.\u0275prov=u({token:r,factory:r.\u0275fac,providedIn:"root"})}}return r})();function g(){return new d(r=>r.error({status:404,error:{message:"Recipe not found"}}))}var k=[{id:"r1",title:"Weeknight Tomato Basil Pasta",isFavorite:!0,ingredients:`400g spaghetti
2 cups cherry tomatoes, halved
3 cloves garlic, sliced
1/4 cup olive oil
Handful fresh basil
Salt & black pepper
Parmesan, to serve`,steps:`1. Boil the spaghetti in well-salted water until al dente.
2. Meanwhile, warm the olive oil and gently cook the garlic until fragrant.
3. Add the tomatoes and a pinch of salt; cook until they burst and soften.
4. Toss the drained pasta with the sauce and a splash of pasta water.
5. Tear in the basil, finish with Parmesan and serve.`},{id:"r2",title:"Grandma\u2019s Cinnamon Rolls",isFavorite:!0,ingredients:`3 1/2 cups flour
1 cup warm milk
1/4 cup sugar
2 tsp active dry yeast
1/3 cup butter, softened
1 egg
Filling: butter, brown sugar, cinnamon
Glaze: powdered sugar, milk`,steps:`1. Bloom the yeast in warm milk with a pinch of sugar.
2. Mix in sugar, butter, egg and flour; knead into a soft dough.
3. Let rise until doubled, about 1 hour.
4. Roll out, spread filling, roll up and slice.
5. Prove 30 min, then bake at 180\xB0C for 22 minutes. Glaze warm.`},{id:"r3",title:"Smoky Black Bean Tacos",isFavorite:!1,ingredients:`2 cans black beans, drained
1 tsp smoked paprika
1 tsp cumin
1 onion, diced
8 corn tortillas
Avocado, lime, cilantro
Hot sauce to taste`,steps:`1. Saut\xE9 the onion until soft.
2. Add beans, paprika and cumin with a splash of water; simmer 10 min.
3. Lightly char the tortillas.
4. Fill with beans, top with avocado, cilantro and a squeeze of lime.`},{id:"r4",title:"Lemon Herb Roast Chicken",isFavorite:!0,ingredients:`1 whole chicken (1.5kg)
1 lemon, halved
4 sprigs thyme
3 tbsp butter, softened
4 cloves garlic
Salt & pepper`,steps:`1. Heat oven to 200\xB0C.
2. Rub the chicken with butter, salt and pepper; stuff with lemon, garlic and thyme.
3. Roast 70\u201380 minutes, basting once, until juices run clear.
4. Rest 15 minutes before carving.`},{id:"r5",title:"Creamy Mushroom Risotto",isFavorite:!1,ingredients:`1 1/2 cups arborio rice
400g mushrooms, sliced
1 onion, finely chopped
1L warm stock
1/2 cup white wine
Parmesan, butter, parsley`,steps:`1. Saut\xE9 mushrooms until golden; set aside.
2. Soften the onion, add rice and toast 1 minute.
3. Deglaze with wine, then add stock a ladle at a time, stirring.
4. When creamy and al dente, stir in mushrooms, butter and Parmesan.`},{id:"r6",title:"Overnight Oats with Berries",isFavorite:!1,ingredients:`1 cup rolled oats
1 cup milk of choice
1/2 cup yogurt
1 tbsp chia seeds
1 tbsp maple syrup
Mixed berries`,steps:`1. Stir together oats, milk, yogurt, chia and maple syrup.
2. Cover and refrigerate overnight.
3. In the morning, top with berries and enjoy cold.`},{id:"r7",title:"Thai Green Curry",isFavorite:!1,ingredients:`3 tbsp green curry paste
1 can coconut milk
400g chicken or tofu
1 zucchini, sliced
1 red pepper
Fish sauce, lime, basil`,steps:`1. Fry the curry paste until fragrant.
2. Add coconut milk and bring to a gentle simmer.
3. Add protein and vegetables; cook until tender.
4. Season with fish sauce and lime, finish with Thai basil.`},{id:"r8",title:"Chewy Chocolate Chip Cookies",isFavorite:!0,ingredients:`2 1/4 cups flour
1 cup butter, softened
3/4 cup brown sugar
1/2 cup white sugar
2 eggs
1 tsp vanilla
1 tsp baking soda
2 cups chocolate chips`,steps:`1. Cream butter and sugars until fluffy.
2. Beat in eggs and vanilla.
3. Fold in flour and baking soda, then the chocolate chips.
4. Scoop onto trays and bake at 180\xB0C for 11 minutes until edges set.`}];export{R as a};
