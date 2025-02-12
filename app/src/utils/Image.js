const prisma = require("../functions/prisma");

class Image {
  constructor(image = {}) {
    this.id = image.id || null;
    this.url = image.url || null;
    this.selectedFields = {
      id: true,
      url: true,
    };
  }

  async save(url = this.url) {
    let img;
    const imageData = {
      ...(url && { url }),
    };

    if (this.id) {
      img = await prisma.image.update({
        where: { id: this.id },
        data: imageData,
        select: this.selectedFields,
      });
    } else {
      img = await prisma.image.create({
        data: imageData,
        select: this.selectedFields,
      });
      this.id = img.id;
    }
    return img;
  }

  find(image = {}) {
    const id = image.id || this.id;
    const filters = [id && { id }].filter(Boolean);

    if (filters.length === 0) {
      throw new Error("At least one of id must be provided");
    }

    return prisma.image.findFirst({
      where: filters[0],
      select: this.selectedFields,
    });
  }

  delete() {
    return prisma.image.delete({
      where: { id: this.id },
    });
  }
}

module.exports = Image;
