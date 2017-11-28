<?php

namespace Controllers;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\View\Twig;

class Nehemiah extends Base {
	public function info() {
		phpinfo();
	}

	public function dashboard() {
		return Twig::ff('Semantic', 'dashboard.twig');
	}
}
