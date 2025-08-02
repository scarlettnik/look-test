export const filterProducts = (products, filters) => {
    if (!products) return [];

    return products.filter(product => {
        // Фильтрация по размеру
        if (filters.size?.length > 0) {
            if (!filters.size.some(size => product.sizes.includes(size))) {
                return false;
            }
        }

        // Фильтрация по бренду
        if (filters.brand?.length > 0) {
            if (!filters.brand.includes(product.brand)) {
                return false;
            }
        }

        // Фильтрация по цене
        if (filters.price) {
            const productPrice = product.price || 0;
            if (filters.price.min != null && productPrice < filters.price.min) {
                return false;
            }
            if (filters.price.max != null && productPrice > filters.price.max) {
                return false;
            }
        }

        if (filters.type?.length > 0) {
            if (!filters.type.includes(product.type)) {
                return false;
            }
        }

        return true;
    });
};
export const getProductTypes = (products) => {
    const types = new Set();
    products?.forEach(product => {
        const [mainType] = product.category.split('/');
        if (mainType) types.add(mainType.charAt(0).toUpperCase() + mainType.slice(1));
    });
    return Array.from(types);
};