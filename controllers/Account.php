<?php

namespace Controllers;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Session\Session;
use Seasmhach\Nehemiah\Base;
use Seasmhach\Nehemiah\UserInput;
use Seasmhach\Nehemiah\View\Twig;
use Builder\User;
use Builder\Setting;
use OutOfBoundsException;

/**
 * Controller for account actions.
 */
class Account extends Base {
	/**
	 * Setting method permissions
	 */
	public function __construct() {
		$this->method_access = [
			'login' => true,
			'authenticate' => true,
		];
	}

	/**
	 * Get user in JSON format.
	 *
	 * @param  int    $user_id User ID
	 * @return JsonResponse
	 */
	public function get(int $user_id) {
		return new JsonResponse(User::read_by_user_id($user_id));
	}

	/**
	 * Display login form
	 *
	 * @return string Twig login template
	 */
	public function login() {
		$session = new Session();
		$login_error = $session->get('nehemiah_login_error', null);
		$logged_out = $session->get('logged_out', null);

		if (!is_null($login_error)) {
			$session->remove('nehemiah_login_error');
		}

		if ($logged_out) {
			$session->remove('logged_out');
		}

		return Twig::ff('Semantic', 'login.twig', [
			'login_error' => $login_error,
			'logged_out' => $logged_out,
		]);
	}

	/**
	 * Destroy session logging the user out.
	 *
	 * @return RedirectResponse
	 */
	public function logout() {
		$request = Request::CreateFromGlobals();
		$session = new Session;
		$session->invalidate();
		$session->set('logged_out', true);

		return new RedirectResponse($request->headers->get('referer'), 302);
	}

	/**
	 * Authenticate. A session gets created on a successfull login.
	 *
	 * @return RedirectResponse
	 */
	public function authenticate() {
		$request = Request::CreateFromGlobals();
		$user = new User;
		$result = 0;
		$account = $user->login($request->get('login', ''), $request->get('password', ''), $result);
		$session = new Session;

		if ($result === User::LOGIN_OK) {
			$session->set('nehemiah_user', [
				'uid' => $account['user_id'],
				'login' => $account['login'],
				'type' => $account['type'],
				'last_login' => $account['last_login'],
			]);
		} else {
			$session->set('nehemiah_login_error', _("Login failed: Wrong username or password"));
		}

		return new RedirectResponse($request->headers->get('referer'), 302);
	}

	/**
	 * Display user accounts.
	 *
	 * @return string Twig generated template
	 */
	public function display() {
		return Twig::ff('Semantic', 'display.accounts.twig', ['accounts' => User::read_all()]);
	}

	/**
	 * Display account create form.
	 *
	 * @throws OutOfBoundsException If no account types have been defined
	 * @return string Twig generated template
	 */
	public function compose() {
		$setting = Setting::read_by_project_and_setting('account', 'account_types', ['value']);

		if (!$setting) {
			throw new OutOfBoundsException("No account types defined. Please define an account type in your settings and try again.");
		}

		return Twig::ff('Semantic', 'compose.account.twig', [
			'account_types' => explode(',', $setting['value']),
		]);
	}

	/**
	 * Display user account form.
	 *
	 * @param  int    $user_id User ID
	 * @return string Twig generated template
	 */
	public function edit(int $user_id) {
		$user = User::read_by_user_id($user_id, ['user_id', 'login', 'type', 'locked']);
		$setting = Setting::read_by_project_and_setting('account', 'account_types', ['value']);

		if (!$setting) {
			throw new OutOfBoundsException("No account types defined. Please define an account type in your settings and try again.");
		}

		return Twig::ff('Semantic', 'edit.account.twig', [
			'account_types' => explode(',', $setting['value']),
			'user' => $user,
		]);
	}

	/**
	 * Create user account.
	 *
	 * @return JsonResponse
	 */
	public function create() {
		$request = Request::createFromGlobals();
		$input = new UserInput;

		if (empty($login = $request->get('login', ''))) {
			$input->add_error(_("Please enter a username"), 'login');
		}

		if (User::check_existence_by_login($login)) {
			$input->add_error(_("An account with username '$login' already exists"), 'login');
		}

		if (($password = $request->get('password', '')) !== $request->get('repeat_password', '')) {
			$input->add_error(_("Passwords do not match"), 'password', 'repeat_password');
		}

		if (strlen(utf8_decode($password)) < 5) {
			$input->add_error(_("Please enter a password of at least five characters length"), 'password');
		}

		if ($input->has_errors()) {
			return $input->json_response(_("Cannot create user account. Pleas have a look at the following issues:"));
		}

		$user = new User();
		$user->set_login($login);
		$user->set_password_hash($password);
		$user->set_type($request->get('type', ''));
		$user->set_locked($request->get('locked', 0));
		$user->insert();

		return new JsonResponse([
			'action' => 'create',
			'message' => 'The account has been successfully added. The form has been cleared so you can add another user account.',
		]);
	}

	/**
	 * Update user account.
	 *
	 * @return JsonResponse
	 */
	public function update() {
		$request = Request::createFromGlobals();
		$input = new UserInput;
		$user_id = $request->get('user_id', 0);

		if (empty($login = $request->get('login', ''))) {
			$input->add_error(_("Please enter a username"), 'login');
		}

		$user = new User();
		$user->list('1', 'exists');
		$user->login_is($login);
		$user->user_id_is_not($user_id);

		if ($user->select() > 0) {
			$input->add_error(_("An account with the given username already exists"), 'login');
		}

		if ($input->has_errors()) {
			return $input->json_response(_("User account cannot be updated. Please solve the following issues:"));
		}

		$user = new User();
		$user->set_login($login);
		$user->set_type($request->get('type', ''));
		$user->set_locked($request->get('locked', 0));
		$user->user_id_is($user_id);
		$user->update();

		return new JsonResponse([
			'action' => 'update',
			'message' => _('The account has been successfully updated.'),
		]);
	}

	public function update_password() {
		$request = Request::createFromGlobals();
		$input = new UserInput;

		if (($password = $request->get('password', '')) !== $request->get('repeat_password', '')) {
			$input->add_error(_("Passwords do not match"), 'password', 'repeat_password');
		}

		if (strlen(utf8_decode($password)) < 5) {
			$input->add_error(_("Please enter a password of at least five characters length"), 'password');
		}

		if ($input->has_errors()) {
			return $input->json_response(_("Cannot update password. Please solve the following issues:"));
		}

		$user = new User();
		$user->set_password_hash($password);
		$user->user_id_is($request->get('user_id', 0));
		$user->update();

		return new JsonResponse([
			'action' => 'update',
			'message' => _("The password has been successfully updated."),
		]);
	}

	/**
	 * Delete user account.
	 *
	 * @param  int $user_id User ID
	 * @return JsonResponse
	 */
	public function delete(int $user_id) {
		$user = new User();
		$user->user_id_is($user_id);
		$user->delete();

		return new JsonResponse([
			'action' => 'delete',
			'message' => _("The account has been successfully deleted"),
		]);
	}
}
