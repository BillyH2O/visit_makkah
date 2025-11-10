/*
  Warnings:

  - A unique constraint covering the columns `[question]` on the table `FaqItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[url]` on the table `GalleryItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[content]` on the table `Testimonial` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FaqItem_question_key" ON "FaqItem"("question");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryItem_url_key" ON "GalleryItem"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_content_key" ON "Testimonial"("content");
