import React, { memo } from "react";
import { LoaderAnimation } from "./loader.styles";

export const CircleLoader = memo(function CircleLoaderComponet ({ style }: { style: React.CSSProperties }) {
    return <LoaderAnimation style={style}>
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 224 224" fill="none">
            <circle cx="112" cy="112" r="112" fill="white"/>
            <circle cx="112" cy="112" r="112" fill="url(#paint0_linear_828_1396)" fillOpacity="0.4"/>
            <path d="M167.085 64C167.129 64.044 167.173 64.0883 167.218 64.1326C167.262 64.1769 167.307 64.2212 167.351 64.2652L172.084 68.6435C176.425 72.6591 180.767 76.6752 185.11 80.6912V64.9718H192V98C189.952 96.103 187.903 94.1957 185.852 92.2851C181.886 88.5921 177.907 84.8868 173.888 81.2207V96.852H167.085V64Z" fill="#222222"/>
            <path d="M34.3851 69.1224C36.2405 66.3841 39.5098 64.8837 42.6899 64.5304C47.5492 64.0881 52.8501 64.8837 56.6491 68.2386C55.852 68.9912 55.0328 69.7217 54.2135 70.4521C53.3984 71.1789 52.5832 71.9057 51.7897 72.6544C50.0234 71.065 47.6383 70.2704 45.2522 70.2704C43.485 70.1813 41.6295 70.7998 40.6583 72.3011C39.9513 73.361 40.2167 74.9504 41.188 75.7451C42.5842 76.9086 44.3209 77.5266 46.04 78.1384C46.2787 78.2233 46.5171 78.3082 46.7542 78.3943C49.5809 79.278 52.4085 80.2489 54.7055 82.1916C57.8857 84.7537 58.5926 89.9632 56.1194 93.231C53.9986 96.0573 50.5531 97.5586 47.1076 97.8219C44.0147 97.91 40.9226 97.8219 38.0068 96.7639C35.7989 96.0573 33.8554 94.8203 32 93.4943C32.7946 92.7445 33.6113 91.9944 34.4281 91.2443C35.2456 90.4934 36.0634 89.7424 36.8593 88.9914C39.5979 91.1112 43.1315 92.2591 46.5779 91.8178C48.0789 91.5535 49.67 90.7579 50.1997 89.2566C50.5531 87.9324 49.7581 86.6073 48.6096 85.9888C46.9387 85.0281 45.1292 84.4234 43.3216 83.8193C41.3064 83.1459 39.2934 82.4732 37.4771 81.3088C35.6217 80.1608 34.0317 78.3943 33.4129 76.2755C32.7069 73.8024 32.9713 71.1531 34.3851 69.1224Z" fill="#222222"/>
            <path d="M76.2626 65.0599H69.3716V97.0272H76.2626V82.8991H90.2217V97.0272H97.2018V65.0599H90.2217V77.6877H76.2626V65.0599Z" fill="#222222"/>
            <path d="M110.718 65.0599H134.22V70.1813H117.522V77.7767H133.955V82.81H117.522V91.5535H134.22V97.0272H110.718V65.0599Z" fill="#222222"/>
            <path d="M153.392 65.0599H146.5V97.0272H153.392V65.0599Z" fill="#222222"/>
            <path d="M114.035 120.781H113.824L111.422 125H107.801L111.855 118.613L107.777 112.074H111.691L113.977 116.316H114.188L116.473 112.074H120.199L116.145 118.461L120.234 125H116.438L114.035 120.781Z" fill="#222222"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M107.334 136.025H114.759V136.019C121.125 136.019 124.841 139.651 124.841 143.283C124.841 147.554 121.288 149.004 120.277 149.416C120.183 149.455 120.111 149.484 120.066 149.506C122.19 150.026 127.497 152.097 127.497 157.027C127.497 162.729 122.453 167.659 117.942 167.659C115.818 167.659 114.496 166.624 113.964 166.104C112.905 165.068 113.964 164.027 114.759 164.548C115.286 165.068 116.088 165.326 117.147 165.326C120.599 165.326 121.658 160.396 121.658 157.542C121.658 152.874 116.088 151.576 114.759 151.319C113.7 150.804 113.964 149.763 114.759 149.506C114.859 149.441 115.008 149.361 115.193 149.261L115.193 149.261C116.488 148.561 119.534 146.916 119.534 143.283C119.534 139.131 114.759 138.095 113.964 138.095C112.768 138.095 112.649 138.725 112.445 139.797C112.422 139.917 112.399 140.041 112.372 140.172V164.296C112.372 164.556 112.505 164.621 112.638 164.685C112.771 164.75 112.905 164.814 112.905 165.074C112.905 165.852 111.313 166.893 109.985 167.15C109.224 167.335 108.462 167.254 107.897 167.194C107.676 167.171 107.484 167.15 107.334 167.15C106.539 167.15 106.006 166.115 106.802 165.595C107.071 165.337 107.334 164.817 107.334 164.039V139.914C107.334 138.542 106.881 138.355 106.317 138.122C106.133 138.046 105.938 137.966 105.743 137.838C105.211 137.581 104.947 135.768 107.334 136.025ZM144.275 152.293C144.275 146.849 148.517 141.918 152.765 141.918L152.771 141.924C153.646 141.751 154.059 141.917 154.391 142.051C154.563 142.121 154.713 142.181 154.895 142.181C155.037 142.25 155.199 142.356 155.379 142.475C155.872 142.799 156.506 143.217 157.282 143.217C158.078 143.217 158.61 142.696 159.406 141.918C160.202 141.398 160.728 142.176 160.465 142.696C160.323 143.255 160.179 144.345 160.035 145.433L160.035 145.433C159.913 146.36 159.79 147.287 159.669 147.884V153.329C159.669 154.627 159.669 157.481 160.728 157.481C161.518 157.481 162.043 156.968 162.572 156.451L162.583 156.44C163.11 155.405 164.438 156.44 163.642 157.481C163.617 157.518 163.589 157.559 163.559 157.604C162.954 158.501 161.367 160.855 158.335 160.855C157.276 160.855 155.948 160.072 155.152 159.037C154.357 160.335 153.028 161.113 151.437 161.113C147.458 161.113 144.275 157.224 144.275 152.293ZM154.916 150.157C154.991 147.504 155.089 143.995 153.298 143.995C151.174 143.995 149.582 148.147 149.582 151.258C149.582 153.849 149.851 158.779 152.239 158.779C154.626 158.779 154.889 153.849 154.889 151.516C154.889 151.111 154.902 150.648 154.916 150.157ZM165.032 143.128C164.236 143.128 164.236 143.386 164.236 143.649C164.236 143.912 164.5 144.427 164.769 144.684V151.427C164.769 152.339 164.678 153.162 164.604 153.843C164.551 154.325 164.505 154.737 164.505 155.059C164.505 156.357 164.505 157.913 165.038 159.211C165.57 160.51 167.162 161.288 168.49 161.288C172.469 161.288 173.534 158.176 173.797 157.135C174.06 156.357 173.797 156.1 173.797 156.1C173.264 155.843 173.001 156.1 173.001 156.357C172.962 156.396 172.905 156.457 172.833 156.535C172.426 156.974 171.554 157.913 170.877 157.913C169.818 157.913 169.549 156.615 169.549 154.802C169.549 153.586 169.639 152.103 169.714 150.875L169.714 150.874L169.714 150.873L169.714 150.872V150.872V150.872V150.872V150.871L169.714 150.871L169.715 150.866L169.715 150.866C169.767 150.001 169.812 149.264 169.812 148.836C170.076 147.538 170.608 145.725 171.936 145.725C172.469 145.725 172.732 145.982 172.732 146.245C172.732 146.445 172.693 146.605 172.661 146.742C172.608 146.963 172.569 147.122 172.732 147.281C172.732 147.538 173.528 148.058 174.587 148.058C175.119 148.058 177.243 147.538 177.243 145.204C177.243 142.871 174.856 142.093 173.528 142.093C172.995 142.093 170.877 142.614 169.812 143.906H169.549C169.812 143.128 169.812 142.608 169.812 142.093C169.812 141.315 169.549 141.573 169.28 141.836C169.185 141.882 169.073 141.953 168.937 142.039L168.937 142.039L168.936 142.039L168.936 142.039C168.316 142.433 167.212 143.134 165.032 143.134V143.128ZM74.3652 143.649C74.3652 143.386 74.3652 143.128 75.161 143.128V143.134C77.3407 143.134 78.4449 142.433 79.0652 142.039C79.2008 141.953 79.3133 141.882 79.4088 141.836C79.6779 141.573 79.9412 141.315 79.9412 142.093C79.9412 142.608 79.9412 143.128 79.6779 143.906H79.9412C81.0061 142.614 83.1242 142.093 83.6566 142.093C84.9848 142.093 87.372 142.871 87.372 145.204C87.372 147.538 85.2481 148.058 84.7156 148.058C83.6566 148.058 82.8609 147.538 82.8609 147.281C82.6983 147.122 82.7365 146.963 82.7895 146.742C82.8223 146.605 82.8609 146.445 82.8609 146.245C82.8609 145.982 82.5976 145.725 82.0651 145.725C80.737 145.725 80.2045 147.538 79.9412 148.836C79.9412 149.265 79.8961 150.005 79.8433 150.872L79.8432 150.872L79.8432 150.873L79.8432 150.873L79.8432 150.873V150.873L79.8432 150.873C79.7683 152.101 79.6779 153.585 79.6779 154.802C79.6779 156.615 79.9471 157.913 81.0061 157.913C81.683 157.913 82.5547 156.974 82.962 156.535L82.9621 156.534C83.0336 156.457 83.0907 156.396 83.13 156.357C83.13 156.1 83.3933 155.843 83.9258 156.1C83.9258 156.1 84.189 156.357 83.9258 157.135C83.6625 158.176 82.5976 161.288 78.6189 161.288C77.2907 161.288 75.6993 160.51 75.1668 159.211C74.6344 157.913 74.6344 156.357 74.6344 155.059C74.6344 154.737 74.6796 154.325 74.7325 153.843V153.843C74.8073 153.161 74.8977 152.339 74.8977 151.427V144.684C74.6285 144.427 74.3652 143.912 74.3652 143.649ZM184.551 142.191C182.696 142.191 181.368 142.712 180.04 143.49C178.185 144.788 177.653 147.122 177.653 148.677C177.653 151.011 179.508 152.309 180.836 152.83C181.631 153.35 183.755 154.128 184.288 154.128C184.343 154.182 184.48 154.259 184.663 154.361C185.349 154.746 186.675 155.49 186.675 156.719C186.675 158.275 185.616 159.573 183.755 159.573C181.631 159.573 180.572 158.275 180.572 156.976C180.572 156.719 180.572 156.198 181.105 155.941C181.368 155.684 181.105 155.421 180.842 155.163C180.578 154.643 180.046 154.385 178.987 154.385C178.191 154.385 176.6 154.906 176.6 156.719C176.6 159.83 180.052 161.649 183.498 161.649C185.089 161.649 186.154 161.392 187.477 160.871C189.601 159.836 191.192 156.982 191.192 154.648C191.192 151.537 188.009 150.496 187.213 150.239C186.154 149.981 184.563 149.203 183.761 148.683C182.965 148.426 181.637 147.905 181.637 146.349C181.637 145.051 182.965 144.016 184.288 144.016C185.347 144.016 186.675 144.794 186.675 145.572C186.675 145.7 186.609 145.895 186.543 146.089C186.478 146.284 186.412 146.478 186.412 146.607C186.236 146.778 186.148 146.952 186.148 147.127C186.681 148.163 187.477 148.683 188.272 148.683C189.864 148.683 190.66 147.648 190.66 146.086C190.66 143.753 187.74 142.197 184.557 142.197L184.551 142.191ZM39.1829 142.582C41.3002 139.472 45.0134 136.619 49.2591 136.616C54.8298 136.619 56.42 139.471 56.42 141.804C56.42 143.36 55.0918 144.915 53.237 144.915C50.8498 144.915 49.7908 142.576 50.5865 141.541C50.6439 141.43 50.713 141.319 50.7836 141.205C51.0443 140.787 51.3261 140.334 51.119 139.722C51.119 139.207 50.5865 138.687 49.5275 138.687C47.6669 138.687 45.5488 140.5 44.2206 143.097C42.6292 145.951 41.8334 149.84 41.8334 153.214C41.8334 164.367 47.4036 165.666 49.5275 165.666C52.1838 165.666 54.3078 164.11 55.3668 163.332C56.4317 162.291 57.4907 163.589 56.695 164.367L56.6769 164.394C56.1264 165.208 54.2398 167.999 48.2052 167.999C43.9632 167.999 40.7803 165.929 38.9196 163.332C36.5324 159.957 36 156.068 36 153.214C36 149.845 36.7957 145.956 39.1829 142.582ZM49.2591 136.616L49.2642 136.616H49.2525L49.2591 136.616ZM62.591 142.359C58.0799 142.359 53.832 147.289 53.832 152.734C53.832 157.664 57.015 161.553 60.9936 161.553C62.5851 161.553 63.9133 161.033 64.9723 159.74C65.7681 160.775 66.8271 161.553 68.1553 161.553C70.9886 161.553 72.8191 158.865 73.4115 157.995L73.4621 157.921C73.9946 156.886 72.9297 156.108 72.1339 156.886C71.6015 157.664 71.0749 158.184 70.5425 158.184C69.2143 158.184 69.2143 155.33 69.2143 154.032C69.2143 153.383 69.2801 152.28 69.3459 151.178L69.346 151.178C69.4118 150.075 69.4776 148.973 69.4776 148.324C69.4776 147.026 69.7409 144.172 70.01 143.394C70.2733 142.616 69.7467 141.838 68.951 142.616C68.7891 142.722 68.6382 142.827 68.4937 142.929L68.4936 142.929C67.9277 143.325 67.4609 143.651 66.8271 143.651C66.1845 143.651 65.5419 143.312 65.0379 143.046C64.9178 142.982 64.8056 142.923 64.7032 142.873L64.6775 142.861C64.1537 142.608 63.627 142.353 62.5793 142.353L62.591 142.359ZM62.8543 144.692C64.6546 144.474 64.5463 148.168 64.4715 150.72L64.4715 150.72C64.4581 151.179 64.4457 151.6 64.4457 151.956C64.4457 154.289 64.4457 159.22 61.7952 159.22C59.6713 159.22 59.408 154.552 59.408 151.956C59.408 148.587 60.9995 144.692 62.8601 144.692H62.8543ZM85.8809 152.995C85.8809 148.072 89.3317 142.365 95.4324 142.363C99.9413 142.364 101.269 146.773 101.269 148.328C101.269 149.884 100.737 150.662 99.6775 150.919C99.1687 151.252 96.7083 151.795 94.5135 152.279L94.5134 152.28C93.2754 152.553 92.122 152.807 91.451 152.995C91.1877 153.773 92.2467 158.961 96.4946 158.961C98.3739 158.961 99.1037 158.319 99.846 157.666L99.846 157.666C100.047 157.49 100.248 157.313 100.473 157.147C101.269 156.107 102.597 157.147 101.801 158.183C101.269 159.224 99.1451 161.557 95.1664 161.557C91.451 161.557 85.8809 158.703 85.8809 152.995ZM96.2313 149.369C96.7637 148.591 96.7637 144.439 95.1722 144.439V144.445C92.7792 144.445 91.4569 149.369 91.7202 150.667C93.3116 150.404 95.6988 149.889 96.2313 149.369ZM137.2 142.363C131.099 142.365 127.648 148.072 127.648 152.995C127.648 158.703 133.219 161.557 136.934 161.557C140.913 161.557 143.037 159.224 143.569 158.183C144.365 157.147 143.037 156.107 142.241 157.147C142.016 157.313 141.814 157.49 141.614 157.666C140.871 158.319 140.142 158.961 138.262 158.961C134.014 158.961 132.955 153.773 133.219 152.995C133.89 152.807 135.043 152.553 136.281 152.279C138.476 151.795 140.936 151.252 141.445 150.919C142.504 150.662 143.037 149.884 143.037 148.328C143.037 146.773 141.709 142.364 137.2 142.363ZM137.2 142.363C137.201 142.363 137.202 142.363 137.203 142.363H137.197C137.198 142.363 137.199 142.363 137.2 142.363ZM136.94 144.439C138.531 144.439 138.531 148.591 137.999 149.369C137.466 149.889 135.079 150.404 133.488 150.667C133.224 149.369 134.547 144.445 136.94 144.445V144.439ZM191.125 144.045H191.803V141.964H192.577V141.43H190.354V141.964H191.125V144.045ZM193.062 144.045H193.691V142.394H193.724L194.321 143.844H194.742L195.337 142.394H195.371V144.045H195.999V141.43H195.197L194.549 143.028H194.514L193.865 141.43H193.062V144.045Z" fill="#222222"/>
            <defs>
                <linearGradient id="paint0_linear_828_1396" x1="18" y1="18.6667" x2="204.668" y2="184.63" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDF365"/>
                    <stop offset="0.231268" stopColor="#94D1F2"/>
                    <stop offset="0.480917" stopColor="#B2A2DD"/>
                    <stop offset="0.691587" stopColor="#F49ABF"/>
                    <stop offset="1" stopColor="#F38275"/>
                </linearGradient>
            </defs>
        </svg>
    </LoaderAnimation>;
});
