import React, {useEffect, useState} from "react";
import {ErrorMessage, Field, Form, Formik} from "formik";
import '../student/create-student.css'
import anh from '../image/default-avatar.png';
import * as Yup from "yup";
import {save} from "../../service/StudentService";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as gradeService from '../../service/GradeService';
import {storage} from "../../config/firebaseConfig";
import {useNavigate} from "react-router-dom";

const URL1 = "http://localhost:8080/api/get-all-grade";

export function Create() {
    const [grades, setGrades] = useState([])
    const [avatar, setAvatar] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState('')
    const [errorData, setErrorData] = useState({})
    const [errorAvatar, setErrorAvatar] = useState('Ảnh không được để trống')


    const navigate = useNavigate()


    useEffect(() => {
        findGrade();
    }, []);


    const findGrade = async () => {
        try {
            const result = await gradeService.findAllGrade(URL1);
            setGrades(result);
        } catch (error) {
            console.error("Error fetching grades:", error);
        }
    }


    const onAvatarChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setErrorAvatar('')
            setAvatar(event.target.files[0]);
            setAvatarUrl(URL.createObjectURL(event.target.files[0]));
        }
    };


    const handleAvatarUpload = async () => {
        try {
            // if (avatar) {
            //     const uploadTask = storage.ref(`${avatar.name}`).put(avatar);
            //     await uploadTask;
            //     const downloadUrl = await storage.ref(avatar.name).getDownloadURL();
            //     setAvatarUrl(downloadUrl);
            // }
            if (avatar) {
                const uploadTask = storage.ref(`${avatar.name}`).put(avatar);
                const snapshot = await uploadTask;
                const downloadUrl = await snapshot.ref.getDownloadURL();

                setAvatarUrl(downloadUrl);
            }
        } catch (error) {
            console.error("Error uploading avatar:", error);
            throw error;
        }
    };


    return (
        <>
            <Formik
                initialValues=
                    {{
                        studentId: '',
                        name: '',
                        dateOfBirth: '',
                        address: '',
                        phone: '',
                        email: '',
                        avatar:'',
                        gender: false,
                        deleteFlag: '',
                        grade: 3,
                        account: ''
                    }}


                onSubmit={async (values) => {

                    try {
                        await handleAvatarUpload();
                        values.avatar = avatar?.name;
                        const response = await save(values);

                        if (response != null) {
                            setErrorData(response)
                            toast('Lỗi! thêm mới sinh viên thất bại');
                        } else {
                            setErrorData({})
                            toast('🦄 Thêm mới sinh viên thành công!!!!');
                            setTimeout(() => {
                                navigate("/list-student")
                            }, 1000)
                        }
                        console.log(errorData)
                    } catch (error) {
                        toast('Lỗi! thêm mới sinh viên thất bại');
                        console.log(error)
                    }
                }}


                validationSchema={Yup.object({
                    name: Yup.string()
                        .required('Tên sinh viên không được để trống')
                        .min(5, 'Tên sinh viên không được bé hơn 5')
                        .max(50, 'Tên sinh viên không được lớn hơn 50')
                        .matches(/^[\p{L}\s]+$/u, "Tên sinh viên không được chứa ký tự đặc biệt"),
                    email: Yup.string()
                        .required('Email không được để trống')
                        .max(50, "Email không được lớn hơn 50")
                        .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Email không hợp lệ'),
                    phone: Yup.string()
                        .required('Số điện thoại không được để trống')
                        .min(10, "Số điện thoại phải tối thiểu 10 chữ số")
                        .matches(/^[0-9]+$/, 'Số điện thoại không hợp lệ'),
                    dateOfBirth: Yup.string()
                        .required("Ngày tháng năm không được để trống")
                        .matches(/^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/, "Ngày tháng năm  không hợp lệ")
                        .test('valid-age', '', function (value) {
                            const now = new Date();
                            const birthDate = new Date(value);
                            const age = now.getFullYear() - birthDate.getFullYear();

                            if (age < 18 || age > 50) {
                                return this.createError({
                                    path: 'dateOfBirth',
                                    message: 'Tuổi sinh viên phải từ 18 đến 50',
                                });
                            }

                            return true;
                        }),
                    address: Yup.string()
                        .required("Địa chỉ không được để trống")
                        .min(5, 'Địa chỉ không được bé hơn 5')
                        .max(50, 'Địa chỉ viên không được lớn hơn 50')

                })}
            >
                <Form>
                    <div className="khoahnd-container" style={{marginTop: "80px"}}>

                        <div className="khoahnd-header">
                            <h2 className="khoahnd-title">THÊM MỚI SINH VIÊN</h2>
                        </div>


                        <div className="khoahnd_form" style={{display: "flex", gap: "100px"}}>



                            <div className="group">
                                <div className="khoahnd-avatar-container">
                                    <img src={avatarUrl || (avatar ? URL.createObjectURL(avatar) : anh)} alt="avatar"
                                         className="khoahnd-avatar" id="avatar-image"/>
                                    <div className="khoahnd-form-group mt-2" style={{textAlign: "center"}}>
                                        <input
                                            type="file"
                                            id="avatar"
                                            onChange={onAvatarChange}
                                            name="avatar"
                                            style={{
                                                display: 'none', // Hide the input
                                            }}
                                        />
                                        <label htmlFor="avatar" className={`btn btn-outline-primary label-custom `}
                                               style={{display: 'inline'}}>
                                            Chọn ảnh đại diện
                                        </label>
                                        <ErrorMessage name="avatar" className="text-danger" component="p" />
                                        {errorAvatar && <p style={{color: "#dc3545"}}>{errorAvatar}</p>}
                                        {errorData['errorFileFormat'] && <div
                                            className="text-danger">{errorData['errorFileFormat']}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="group1">
                                <div className="khoahnd-form-group">
                                    <label htmlFor="name" className="create_label">Tên Sinh Viên (<span
                                        className="text-danger">*</span>):</label>
                                    <Field type="text" className="form-control" id="name" name="name"/>
                                    <ErrorMessage name="name" className="text-danger" component="p"/>
                                </div>
                                <div className="khoahnd-form-group">
                                    <label htmlFor="dateOfBirth" className="create_label">Ngày Sinh (<span
                                        className="text-danger">*</span>):</label>
                                    <Field type="date" className="form-control" id="dateOfBirth"
                                           name="dateOfBirth"/>
                                    <ErrorMessage name="dateOfBirth" className="text-danger" component="p"/>
                                </div>
                                <div className="khoahnd-form-group">
                                    <label htmlFor="email" className="create_label">Email (<span
                                        className="text-danger">*</span>):</label>
                                    <Field type="text" className="form-control" id="email" name="email"/>
                                    <ErrorMessage name="email" className="text-danger" component="p"/>
                                    {errorData['errorEmailDuplicate'] && <div
                                        className="text-danger">{errorData['errorEmailDuplicate']}</div>}
                                </div>
                                <div className="khoahnd-form-group">
                                    <label htmlFor="grade" className="create_label">Lớp (<span
                                        className="text-danger">*</span>):</label>
                                    <Field as="select" className="form-control" id="grade" name="grade">
                                        {grades && grades.length > 0 ? (
                                            grades.map((grade) => (
                                                <option key={grade.gradeId} value={grade.gradeId}>{grade.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Không có lớp nào</option>
                                        )}
                                    </Field>
                                    <ErrorMessage name="grade" className="text-danger" component="p"/>
                                </div>
                            </div>
                            <div className="group2">
                                <div className="khoahnd-form-group">
                                    <label htmlFor="phone" className="create_label">Số Điện Thoại (<span
                                        className="text-danger">*</span>):</label>
                                    <Field type="text" className="form-control" id="phone" name="phone"/>
                                    <ErrorMessage name="phone" className="text-danger" component="p"/>
                                    {errorData['errorPhoneDuplicate'] && <div
                                        className="text-danger">{errorData['errorPhoneDuplicate']}</div>}
                                </div>
                                <div className="khoahnd-form-group">
                                    <label htmlFor="address" className="create_label">Địa Chỉ (<span
                                        className="text-danger">*</span>):</label>
                                    <Field as="textarea" className="form-control" id="address" name="address"/>
                                    <ErrorMessage name="address" className="text-danger" component="p"/>
                                </div>
                                <div className="khoahnd-form-group">
                                    <label htmlFor="gender" className="create_label">Giới Tính (<span
                                        className="text-danger">*</span>):</label>
                                    <Field as="select" className="form-control" id="gender" name="gender">
                                        <option value={true}>Nam</option>
                                        <option value={false}>Nữ</option>
                                    </Field>
                                </div>
                                <div className="mt-3 khoahnd-save-exit-buttons">
                                    <button type="submit" className="btn btn-outline-success">Lưu</button>
                                    <button className="btn btn-outline-secondary ml-2">Thoát</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Form>
            </Formik>
        </>
    );
}
