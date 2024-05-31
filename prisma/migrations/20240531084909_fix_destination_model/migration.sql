-- AlterTable
ALTER TABLE `destination` MODIFY `description` TEXT NOT NULL,
    MODIFY `img` TEXT NOT NULL,
    MODIFY `location` VARCHAR(50) NOT NULL;


-- Add triggers
CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  SET NEW.password = SHA2(NEW.password, 256);
END;

CREATE TRIGGER before_update_users
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.password = SHA2(NEW.password, 256);
END;
