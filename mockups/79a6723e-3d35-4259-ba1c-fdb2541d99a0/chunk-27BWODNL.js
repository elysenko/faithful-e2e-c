import{A as v,C as g,E as h,F as P,H as O,I as f,J as b,K as C,L as x,M as n,N as i,P as k,Q as m,R as s,S as r,T as u,U as F,Z as S,a as y,b as D,ca as _,ea as E,ja as R,la as T,ma as V,q as M,u as d,v as p,z as l}from"./chunk-I2RWAEUL.js";function B(a,c){a&1&&(n(0,"span",9),r(1,"\u2605 Favorite"),i())}function I(a,c){if(a&1&&(n(0,"li"),r(1),i()),a&2){let e=c.$implicit;l(),u(e)}}function z(a,c){if(a&1&&(n(0,"li"),r(1),i()),a&2){let e=c.$implicit;l(),u(e)}}function L(a,c){if(a&1){let e=k();n(0,"article",3)(1,"header",5)(2,"div",6)(3,"span",7),r(4,"\u{1F37D}\uFE0F"),i(),n(5,"h1"),r(6),i()(),n(7,"button",8),m("click",function(){d(e);let t=s();return p(t.toggleFavorite())}),r(8),i()(),h(9,B,2,0,"span",9),n(10,"section",10)(11,"h2"),r(12,"Ingredients"),i(),n(13,"ul",11),C(14,I,2,1,"li",null,b),i()(),n(16,"section",10)(17,"h2"),r(18,"Steps"),i(),n(19,"ol",12),C(20,z,2,1,"li",null,b),i()(),n(22,"footer",13)(23,"button",14),m("click",function(){d(e);let t=s();return p(t.edit())}),r(24,"\u270F\uFE0F Edit"),i(),n(25,"button",15),m("click",function(){d(e);let t=s();return p(t.askDelete())}),r(26,"\u{1F5D1}\uFE0F Delete"),i()()()}if(a&2){let e=c,o=s();l(6),u(e.title),l(),O("on",e.isFavorite),P("aria-label",e.isFavorite?"Remove from favorites":"Add to favorites"),l(),u(e.isFavorite?"\u2605":"\u2606"),l(),f(9,e.isFavorite?9:-1),l(5),x(o.ingredientLines()),l(6),x(o.stepLines())}}function j(a,c){a&1&&(n(0,"div",16)(1,"span",17),r(2,"\u{1F50E}"),i(),n(3,"h2"),r(4,"Recipe not found"),i(),n(5,"p",18),r(6,"This recipe may have been deleted, or the link is incorrect."),i(),n(7,"a",19),r(8,"Back to my recipes"),i()())}function A(a,c){if(a&1){let e=k();n(0,"div",20),m("click",function(){d(e);let t=s();return p(t.cancelDelete())}),n(1,"div",21),m("click",function(t){return d(e),p(t.stopPropagation())}),n(2,"h3"),r(3,"Delete this recipe?"),i(),n(4,"p",18),r(5),i(),n(6,"div",22)(7,"button",14),m("click",function(){d(e);let t=s();return p(t.cancelDelete())}),r(8,"Cancel"),i(),n(9,"button",15),m("click",function(){d(e);let t=s();return p(t.confirmDelete())}),r(10,"Delete recipe"),i()()()()}if(a&2){let e,o=s();l(5),F("\u201C",(e=o.recipe())==null?null:e.title,"\u201D will be permanently removed. This can\u2019t be undone.")}}var K=(()=>{class a{constructor(e,o){this.route=e,this.router=o,this.recipes=g([{id:"r1",title:"Weeknight Tomato Basil Pasta",isFavorite:!0,ingredients:`400g spaghetti
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
4. Scoop onto trays and bake at 180\xB0C for 11 minutes until edges set.`}]),this.id=g(""),this.confirmingDelete=g(!1),this.recipe=_(()=>this.recipes().find(t=>t.id===this.id())),this.ingredientLines=_(()=>(this.recipe()?.ingredients??"").split(`
`).map(t=>t.trim()).filter(Boolean)),this.stepLines=_(()=>(this.recipe()?.steps??"").split(`
`).map(t=>t.trim()).filter(Boolean))}ngOnInit(){this.id.set(this.route.snapshot.paramMap.get("id")??"")}toggleFavorite(){let e=this.recipe();e&&this.recipes.update(o=>o.map(t=>t.id===e.id?D(y({},t),{isFavorite:!t.isFavorite}):t))}edit(){this.router.navigate(["/recipes",this.id(),"edit"])}askDelete(){this.confirmingDelete.set(!0)}cancelDelete(){this.confirmingDelete.set(!1)}confirmDelete(){this.router.navigate(["/"])}static{this.\u0275fac=function(o){return new(o||a)(v(R),v(T))}}static{this.\u0275cmp=M({type:a,selectors:[["app-recipe-detail"]],standalone:!0,features:[S],decls:7,vars:2,consts:[[1,"page","page-narrow"],[1,"page-head"],["routerLink","/",1,"btn","btn-ghost","btn-sm","back"],[1,"detail","card","card-pad"],[1,"modal-scrim"],[1,"detail-head"],[1,"detail-title"],["aria-hidden","true",1,"rc-emoji"],["type","button",1,"fav-btn",3,"click"],[1,"badge","badge-brand","fav-tag"],[1,"block"],[1,"ingredients"],[1,"steps"],[1,"detail-actions"],["type","button",1,"btn","btn-outline",3,"click"],["type","button",1,"btn","btn-danger",3,"click"],[1,"state","card","card-pad"],["aria-hidden","true",1,"state-icon"],[1,"muted"],["routerLink","/",1,"btn","btn-primary"],[1,"modal-scrim",3,"click"],["role","dialog","aria-modal","true","aria-label","Delete recipe",1,"modal","card",3,"click"],[1,"modal-actions"]],template:function(o,t){if(o&1&&(n(0,"div",0)(1,"div",1)(2,"a",2),r(3,"\u2190 All recipes"),i()(),h(4,L,27,6,"article",3)(5,j,9,0),i(),h(6,A,11,1,"div",4)),o&2){let w;l(4),f(4,(w=t.recipe())?4:5,w),l(2),f(6,t.confirmingDelete()?6:-1)}},dependencies:[E,V],styles:[".back[_ngcontent-%COMP%]{padding-left:0}.detail-head[_ngcontent-%COMP%]{display:flex;align-items:flex-start;gap:var(--space-3)}.detail-title[_ngcontent-%COMP%]{display:flex;align-items:center;gap:var(--space-3);flex:1}.detail-title[_ngcontent-%COMP%]   h1[_ngcontent-%COMP%]{font-size:var(--fs-xl);line-height:1.2}.rc-emoji[_ngcontent-%COMP%]{display:inline-grid;place-items:center;width:48px;height:48px;border-radius:var(--radius);background:var(--color-brand-tint);font-size:var(--fs-lg);flex:none}.fav-btn[_ngcontent-%COMP%]{flex:none;display:grid;place-items:center;width:48px;height:48px;min-height:44px;border:1px solid var(--color-border-strong);border-radius:50%;background:var(--color-surface);color:var(--color-faint);font-size:var(--fs-xl);cursor:pointer;transition:background .15s,color .15s}.fav-btn[_ngcontent-%COMP%]:active{transform:scale(.96)}.fav-btn.on[_ngcontent-%COMP%]{color:var(--color-accent);border-color:var(--color-accent);background:var(--color-accent-light)}.fav-tag[_ngcontent-%COMP%]{margin-top:var(--space-3)}.block[_ngcontent-%COMP%]{margin-top:var(--space-5)}.block[_ngcontent-%COMP%]   h2[_ngcontent-%COMP%]{font-size:var(--fs-md);color:var(--color-brand-dark);margin-bottom:var(--space-3);padding-bottom:var(--space-2);border-bottom:2px solid var(--color-brand-light)}.ingredients[_ngcontent-%COMP%]{margin:0;padding-left:var(--space-5)}.ingredients[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{margin-bottom:var(--space-2);line-height:1.5}.steps[_ngcontent-%COMP%]{margin:0;padding-left:var(--space-5)}.steps[_ngcontent-%COMP%]   li[_ngcontent-%COMP%]{margin-bottom:var(--space-3);line-height:1.55;padding-left:var(--space-1)}.detail-actions[_ngcontent-%COMP%]{display:flex;gap:var(--space-3);margin-top:var(--space-6);padding-top:var(--space-4);border-top:1px solid var(--color-border)}.detail-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{flex:1}.modal-scrim[_ngcontent-%COMP%]{position:fixed;inset:0;z-index:40;display:flex;align-items:flex-end;justify-content:center;padding:var(--space-4);background:#2c201873}.modal[_ngcontent-%COMP%]{width:100%;max-width:420px;padding:var(--space-5);margin-bottom:calc(var(--bottomnav-h) + var(--safe-bottom))}.modal[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{font-size:var(--fs-lg);margin-bottom:var(--space-2)}.modal-actions[_ngcontent-%COMP%]{display:flex;gap:var(--space-3);margin-top:var(--space-4)}.modal-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{flex:1}@media (min-width: 560px){.modal-scrim[_ngcontent-%COMP%]{align-items:center}.modal[_ngcontent-%COMP%]{margin-bottom:0}.detail-actions[_ngcontent-%COMP%]{justify-content:flex-end}.detail-actions[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]{flex:0 0 auto;min-width:130px}}"]})}}return a})();export{K as RecipeDetailComponent};
