import React from 'react'
import ExamPage from './ExamClient'

export default async function page({ searchParams }) {
    const params = await searchParams;

    return (
        <div>
            <ExamPage email={params?.email} />
        </div>
    )
}
