UPDATE `SystemSetting`
SET `value` = ''
WHERE `key` = 'default_payment_amount'
  AND `value` = '99.00';
