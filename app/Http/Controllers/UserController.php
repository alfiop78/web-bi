<?php
namespace App\Http\Controllers;

// non è necessario estendere la classe Base
// use Illuminate\Routing\Controller as BaseController;

/* class UserController extends BaseController { */
/*  */
/*     public function index() { */
/*         return 'User1, User2, User3'; */
/*     } */
/*  */
/*     public function page_2() { */
/*         return 'page 2 test'; */
/*     } */
/*  */
/* } */

class UserController extends Controller {

    public function index() {
        return 'User1, User2, User3';
    }

    public function page_2() {
        return 'page 2 test';
    }

}
