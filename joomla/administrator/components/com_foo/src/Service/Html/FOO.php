<?php
/**
 * @version    CVS: 1.0.0
 * @package    Com_Foo
 * @author     Maikol Ortigueira <maikol@maikol.eu>
 * @copyright  2023 Maikol Ortigueira
 * @license    Licencia Pública General GNU versión 2 o posterior. Consulte LICENSE.txt
 */

namespace Ortiga\Component\Foo\Administrator\Service\Html;

// No direct access
defined('_JEXEC') or die;

use Joomla\Utilities\ArrayHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\MVC\Model\DatabaseAwareTrait;
use Joomla\Database\DatabaseDriver;

/**
 * Foo HTML Helper.
 *
 * @since  1.0.0
 */
class FOO
{
	use DatabaseAwareTrait;

	/**
	 * Public constructor.
	 *
	 * @param   DatabaseDriver  $db  The Joomla DB driver object for the site's database.
	 */
	public function __construct(DatabaseDriver $db)
	{
		$this->setDbo($db);
	}

	public function toggle($value = 0, $view='', $field='', $i='')
	{
		$states = array(
			0 => array('icon-unpublish', Text::_('Toggle'), ''),
			1 => array('icon-publish', Text::_('Toggle'), '')
		);

		$state  = ArrayHelper::getValue($states, (int) $value, $states[0]);
		$text   = '<span aria-hidden="true" class="' . $state[0] . '"></span>';
		$html   = '<a href="javascript:void(0);" class="tbody-icon ' . $state[2] . '"';
		$html  .= 'onclick="return Joomla.toggleField(\'cb'.$i.'\',\'' . $view . '.toggle\',\'' . $field . '\')" title="' . Text::_($state[1]) . '">' . $text . '</a>';

		return $html;
	}
}
