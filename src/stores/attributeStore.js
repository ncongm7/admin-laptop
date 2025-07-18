import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    getAllHang,
    getAllCpu,
    getAllRam,
    getAllGpu,
    getAllOCung,
    getAllMauSac,
    getAllKichThuocManHinh,
    getAllLoaiManHinh,
    getAllHeDieuHanh,
    getAllDungLuongPin,
    getAllCamera
} from '@/service/apiAttributeOfProduct'

export const useAttributeStore = defineStore('attribute', () => {
    // State
    const attributes = ref({
        brands: [],
        cpus: [],
        rams: [],
        gpus: [],
        storages: [],
        colors: [],
        screens: [],
        displays: [],
        oses: [],
        batteries: [],
        cameras: []
    })

    const loading = ref(false)
    const error = ref(null)

    // Getters
    const getBrands = computed(() => attributes.value.brands)
    const getCpus = computed(() => attributes.value.cpus)
    const getRams = computed(() => attributes.value.rams)
    const getGpus = computed(() => attributes.value.gpus)
    const getStorages = computed(() => attributes.value.storages)
    const getColors = computed(() => attributes.value.colors)
    const getScreens = computed(() => attributes.value.screens)
    const getDisplays = computed(() => attributes.value.displays)
    const getOses = computed(() => attributes.value.oses)
    const getBatteries = computed(() => attributes.value.batteries)
    const getCameras = computed(() => attributes.value.cameras)

    // Actions
    const fetchAttributes = async () => {
        loading.value = true
        error.value = null
        try {
            const [
                brands,
                cpus,
                rams,
                gpus,
                storages,
                colors,
                screens,
                displays,
                oses,
                batteries,
                cameras
            ] = await Promise.all([
                getAllHang(),
                getAllCpu(),
                getAllRam(),
                getAllGpu(),
                getAllOCung(),
                getAllMauSac(),
                getAllKichThuocManHinh(),
                getAllLoaiManHinh(),
                getAllHeDieuHanh(),
                getAllDungLuongPin(),
                getAllCamera()
            ])
            attributes.value = {
                brands: brands || [],
                cpus: cpus || [],
                rams: rams || [],
                gpus: gpus || [],
                storages: storages || [],
                colors: colors || [],
                screens: screens || [],
                displays: displays || [],
                oses: oses || [],
                batteries: batteries || [],
                cameras: cameras || []
            }
        } catch (err) {
            error.value = err.message || 'Có lỗi xảy ra khi tải thuộc tính'
            console.error('Error fetching attributes:', err)
        } finally {
            loading.value = false
        }
    }

    // Các action add/update/delete giữ nguyên, sẽ chuyển đổi sau nếu có API
    const addAttribute = async (type, attributeData) => {
        loading.value = true
        error.value = null
        try {
            // TODO: Sửa lại khi có API
            // const response = await axios.post(`/api/attributes/${type}`, attributeData)
            // await fetchAttributes() // Refresh data
            // return response.data
        } catch (err) {
            error.value = err.message || 'Có lỗi xảy ra khi thêm thuộc tính'
            console.error('Error adding attribute:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateAttribute = async (type, id, attributeData) => {
        loading.value = true
        error.value = null
        try {
            // TODO: Sửa lại khi có API
            // const response = await axios.put(`/api/attributes/${type}/${id}`, attributeData)
            // await fetchAttributes() // Refresh data
            // return response.data
        } catch (err) {
            error.value = err.message || 'Có lỗi xảy ra khi cập nhật thuộc tính'
            console.error('Error updating attribute:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteAttribute = async (type, id) => {
        loading.value = true
        error.value = null
        try {
            // TODO: Sửa lại khi có API
            // await axios.delete(`/api/attributes/${type}/${id}`)
            // await fetchAttributes() // Refresh data
        } catch (err) {
            error.value = err.message || 'Có lỗi xảy ra khi xóa thuộc tính'
            console.error('Error deleting attribute:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const getAttributeById = (type, id) => {
        return attributes.value[type]?.find(attr => attr.id === id)
    }

    const getAttributeByName = (type, name) => {
        return attributes.value[type]?.find(attr =>
            attr.ten?.toLowerCase() === name.toLowerCase() ||
            attr.tenThuocTinh?.toLowerCase() === name.toLowerCase()
        )
    }

    return {
        // State
        attributes,
        loading,
        error,

        // Getters
        getBrands,
        getCpus,
        getRams,
        getGpus,
        getStorages,
        getColors,
        getScreens,
        getDisplays,
        getOses,
        getBatteries,
        getCameras,

        // Actions
        fetchAttributes,
        addAttribute,
        updateAttribute,
        deleteAttribute,
        getAttributeById,
        getAttributeByName
    }
})
