-- CreateTable
CREATE TABLE "destination" (
    "dest_id" VARCHAR(10) NOT NULL,
    "name_dest" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "location" VARCHAR(50) NOT NULL,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("dest_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" VARCHAR(10) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password" VARCHAR(300) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "rating" (
    "rating_id" VARCHAR(10) NOT NULL,
    "rating" INTEGER NOT NULL,
    "user_id" VARCHAR(10) NOT NULL,
    "dest_id" VARCHAR(10) NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "bookmark_detail" (
    "id" VARCHAR(10) NOT NULL,
    "isBookmark" BOOLEAN NOT NULL,
    "user_id" VARCHAR(10) NOT NULL,
    "dest_id" VARCHAR(10) NOT NULL,

    CONSTRAINT "bookmark_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rating_dest_id" ON "rating"("dest_id");

-- CreateIndex
CREATE INDEX "rating_user_id" ON "rating"("user_id");

-- CreateIndex
CREATE INDEX "bookmark_detail_dest_id" ON "bookmark_detail"("dest_id");

-- CreateIndex
CREATE INDEX "bookmark_detail_user_id" ON "bookmark_detail"("user_id");

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_ibfk_2" FOREIGN KEY ("dest_id") REFERENCES "destination"("dest_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_detail" ADD CONSTRAINT "bookmark_detail_ibfk_1" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmark_detail" ADD CONSTRAINT "bookmark_detail_ibfk_2" FOREIGN KEY ("dest_id") REFERENCES "destination"("dest_id") ON DELETE CASCADE ON UPDATE CASCADE;



-- Trigger untuk enkripsi password sebelum insert
CREATE OR REPLACE FUNCTION before_insert_users_function()
RETURNS TRIGGER AS $$
BEGIN
    NEW.password := digest(NEW.password, 'sha256');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_insert_users
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION before_insert_users_function();

-- Trigger untuk enkripsi password sebelum update
CREATE OR REPLACE FUNCTION before_update_users_function()
RETURNS TRIGGER AS $$
BEGIN
    NEW.password := digest(NEW.password, 'sha256');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_update_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION before_update_users_function();
