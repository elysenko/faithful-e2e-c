import{a as R}from"./chunk-MLX4HGUF.js";import"./chunk-5FQN6FLT.js";import{A as m,C as o,E as v,G as h,I as k,M as a,N as i,P as w,Q as C,R as c,S as s,Z as _,_ as y,ca as g,ea as E,ja as S,la as F,ma as x,q as b,u as d,v as p,z as u}from"./chunk-I2RWAEUL.js";var M=t=>["/recipes",t];function T(t,f){if(t&1){let n=w();a(0,"app-recipe-form",4),C("save",function(e){d(n);let l=c();return p(l.onSave(e))})("cancelForm",function(){d(n);let e=c();return p(e.onCancel())}),i()}if(t&2){let n=c();h("value",f)("submitting",n.submitting())("serverError",n.serverError())}}function L(t,f){t&1&&(a(0,"div",5)(1,"span",6),s(2,"\u{1F50E}"),i(),a(3,"h2"),s(4,"Recipe not found"),i(),a(5,"p",7),s(6,"We couldn\u2019t find that recipe to edit."),i(),a(7,"a",8),s(8,"Back to my recipes"),i()())}var j=(()=>{class t{constructor(n,r){this.route=n,this.router=r,this.recipes=o([{id:"r1",title:"Weeknight Tomato Basil Pasta",isFavorite:!0,ingredients:`400g spaghetti
2 cups cherry tomatoes, halved
3 cloves garlic, sliced
1/4 cup olive oil
Handful fresh basil
Salt & black pepper
Parmesan, to serve`,steps:`1. Boil the spaghetti in well-salted water until al dente.
2. Warm the olive oil and gently cook the garlic until fragrant.
3. Add the tomatoes and cook until they burst and soften.
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
4. Scoop onto trays and bake at 180\xB0C for 11 minutes until edges set.`}]),this.id=o(""),this.submitting=o(!1),this.serverError=o(null),this.recipe=g(()=>this.recipes().find(e=>e.id===this.id())),this.formValue=g(()=>{let e=this.recipe();return e?{title:e.title,ingredients:e.ingredients,steps:e.steps}:null})}ngOnInit(){this.id.set(this.route.snapshot.paramMap.get("id")??"")}onSave(n){this.submitting.set(!0),this.serverError.set(null),this.router.navigate(["/recipes",this.id()])}onCancel(){this.router.navigate(["/recipes",this.id()])}static{this.\u0275fac=function(r){return new(r||t)(m(S),m(F))}}static{this.\u0275cmp=b({type:t,selectors:[["app-recipe-edit"]],standalone:!0,features:[_],decls:8,vars:4,consts:[[1,"page","page-narrow"],[1,"page-head"],[1,"btn","btn-ghost","btn-sm","back",3,"routerLink"],["submitLabel","Save changes",3,"value","submitting","serverError"],["submitLabel","Save changes",3,"save","cancelForm","value","submitting","serverError"],[1,"state","card","card-pad"],["aria-hidden","true",1,"state-icon"],[1,"muted"],["routerLink","/",1,"btn","btn-primary"]],template:function(r,e){if(r&1&&(a(0,"div",0)(1,"div",1)(2,"a",2),s(3,"\u2190 Back to recipe"),i(),a(4,"h1"),s(5,"Edit recipe"),i()(),v(6,T,1,3,"app-recipe-form",3)(7,L,9,0),i()),r&2){let l;u(2),h("routerLink",y(2,M,e.id())),u(4),k(6,(l=e.formValue())?6:7,l)}},dependencies:[E,x,R],styles:[".back[_ngcontent-%COMP%]{padding-left:0}.page-head[_ngcontent-%COMP%]{align-items:baseline}.page-head[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{width:100%}"]})}}return t})();export{j as RecipeEditComponent};
